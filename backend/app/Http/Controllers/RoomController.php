<?php

namespace App\Http\Controllers;

use App\Jobs\ConvertVideoForStreaming;
use App\Jobs\CreateThumbnailFromVideo;
use App\Models\Rooms;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use \Illuminate\Support\Str;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

class RoomController extends Controller
{
    public function create(Request $request)
    {
        if ($request->user()->room) {
            return redirect()->route('room.home', [
                'party' => $request->user()->link
            ]);
        } else {
            return Inertia::render('Room/Create');
        }
    }

    public function store(Request $request)
    {
        if ($request->user()->room) {
            return redirect()->route('room.home', [
                'party' => $request->user()->link
            ]);
        } else {
            $link = Str::random(40);
            $videoFileName = Str::random(50);

            $request->validate([
                'title' => ['required', 'max:50'],
                'type' => ['required'],
            ]);

            $room = Rooms::create([
                'title' => $request->title,
                'type' => $request->type,
                'video' => $videoFileName,
                'uid' => $request->user()->id,
                'link' => $link
            ]);

            return response()->json([
                'message' => 'Room created successfully',
                'room' => $room->id,
                'file' => $videoFileName,
                'link' => $room->link
            ]);
        }
    }

    public function join(Request $request)
    {
        $roomLink = $request->query('party');
        $roomData = Rooms::whereRaw("BINARY `link`= ?", array($roomLink))->first();
        if ($roomData != null) {
            $owner = User::find($roomData->uid);
            $finalRoomData = [
                'id' => $roomData->id,
                'status' => $roomData->status,
                'type' => $roomData->type,
                'title' => $roomData->title,
                'uid' => $roomData->uid,
                'uname' => $owner->name,
                'createTime' => $roomData->created_at
            ];
            return Inertia::render('Room/ShowParty', ['roomData' => $finalRoomData]);
        } else {
            return Inertia::render('Errors/404');
        }
    }

    public function processingStatus(Request $request)
    {
        try {
            $uid = $request->id;
            $room = Rooms::where('uid', $uid)->first();
            if ($room->processing) {
                if ($room->process_percentage > 0) {
                    return [
                        'processing' => true,
                        'inQueue' => false,
                        'percentage' => $room->process_percentage
                    ];
                } else {
                    return [
                        'processing' => true,
                        'inQueue' => true,
                        'percentage' => $room->process_percentage
                    ];
                }
            } else if ($room->processed) {
                return [
                    'processing' => false,
                    'inQueue' => false,
                    'msg' => "video already processed for your room"
                ];
            }
        } catch (\Throwable $th) {
            return 'nothing';
        }
    }

    public function deleteRoom(Request $request)
    {
        $room = Rooms::find($request->user()->room);
        if (!$room) {
            $room = Rooms::where('uid', $request->user()->id)->first();
        }

        if ($room) {
            $user = User::find($request->user()->id);

            Storage::disk('upload-videos')->deleteDirectory($user->id);
            Storage::disk('secrets')->deleteDirectory($room->id);
            Storage::disk('videos')->deleteDirectory($room->id);

            $room->delete();
            $user->room = null;
            $user->link = null;
            $user->update();
        }

        if ($request->accepts(['application/json'])) {
            return response()->json([
                'status'=> true
            ]);
        } else {
            return redirect()->route('home');
        }
    }

    public function videoPlaylist(Request $request, $playlist)
    {
        return FFMpeg::dynamicHLSPlaylist()
            ->fromDisk('videos')
            ->open($request->rid . "/" . $playlist)
            ->setKeyUrlResolver(function ($key) {
                global $request;
                return route('video.key', [
                    'key' => $key,
                    'rid' => $request->rid
                ]);
            })
            ->setMediaUrlResolver(function ($mediaFilename) {
                global $request;
                return Storage::disk('videos')->url($request->rid . "/" . $mediaFilename);
            })
            ->setPlaylistUrlResolver(function ($playlistFilename) {
                global $request;
                return route('video.playlist', [
                    'playlist' => $playlistFilename,
                    'rid' => $request->rid
                ]);
            });
    }

    public function videoKey(Request $request, $key)
    {
        return Storage::disk('secrets')->download($request->rid . "/" . $key);
    }

    public function uploadVideo(Request $request)
    {
        $file = $request->file('chunk');
        $chunkNumber = $request->input('index');
        $totalChunks = $request->input('total');
        $fileName = $request->input('filename');
        $extension = $request->input('videoExtension');
        $type = $request->input('videoType');

        $newFileName = "{$fileName}.part{$chunkNumber}";

        $acceptableFiles = ["mp4", "mkv", "avi"];
        $acceptableTypes = ["video/x-matroska","video/mp4","video/avi"];

        if ($request->user()->room) {
            return response()->json([
                'error' => 'You already have a room'
            ], 400);
        }

        if (!in_array($type, $acceptableTypes)) {
            return response()->json("File type is not acceptable", 400);
        }

        if (!in_array($extension, $acceptableFiles)) {
            return response()->json("File type is not acceptable", 400);
        }

        Storage::putFileAs(
            "uploads/chunks/{$request->user()->id}",
            $file,
            $newFileName
        );

        if ($chunkNumber == $totalChunks) {
            $this->mergeChunks($fileName, $totalChunks, $request, $extension);
        }

        return response()->json([
            'message' => 'Chunk uploaded successfully',
            'chunk' => $chunkNumber,
            'total' => $totalChunks,
            'extension' => $extension
        ]);
    }

    private function mergeChunks($fileName, $totalChunks, Request $request, $extension)
    {
        $userId = $request->user()->id;

        $chunkDisk = 'local';
        $chunkDir = "uploads/chunks/{$userId}";
        $chunkPrefix = "{$fileName}.part";

        $finalPath = "{$userId}/{$fileName}.{$extension}";

        if (!Storage::disk($chunkDisk)->exists("uploads/videos/{$userId}")) {
            Storage::disk($chunkDisk)->makeDirectory("uploads/videos/{$userId}");
        }

        $fullFilePath = storage_path("app/uploads/videos/{$finalPath}");
        $output = fopen($fullFilePath, 'wb');

        for ($i = 1; $i <= $totalChunks; $i++) {
            $chunkFilePath = "{$chunkDir}/{$chunkPrefix}{$i}";

            if (!Storage::disk($chunkDisk)->exists($chunkFilePath)) {
                throw new \Exception("Missing chunk: {$chunkFilePath}");
            }

            $chunkStream = Storage::disk($chunkDisk)->readStream($chunkFilePath);
            stream_copy_to_stream($chunkStream, $output);
            fclose($chunkStream);

            Storage::disk($chunkDisk)->delete($chunkFilePath);
        }

        fclose($output);

        $room = Rooms::where('uid', $userId)->first();

        $room->video = "{$fileName}.{$extension}";
        $room->save();

        CreateThumbnailFromVideo::dispatch($room);
        ConvertVideoForStreaming::dispatch($room);

        $room->processing = true;
        $room->save();

        $user = User::find($userId);
        $user->room = $room->id;
        $user->link = $room->link;
        $user->save();
    }
}
