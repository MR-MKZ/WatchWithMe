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
//        dd(User::find($request->user()->id));
        if ($request->user()->room) {
            return redirect()->route('room.home', [
                'party' => $request->user()->link
            ]);
        } else {
            $file = $request->file('video');
            $extension = $file->extension();
            $link = Str::random(40);
            if ($extension == "mkv" || $extension == "mp4" || $extension == "avi") {
                $newFileName = Str::random(50) . "." . $extension;
                $path = Storage::putFileAs(
                    "uploads/videos/" . $request->user()->id,
                    $request->file('video'),
                    $newFileName
                );
                $request->validate([
                    'title' => ['required', 'max:50'],
                    'type' => ['required'],
                    'video' => ['required']
                ]);

                $room = Rooms::create([
                    'title' => $request->title,
                    'type' => $request->type,
                    'video' => $newFileName,
                    'uid' => $request->user()->id,
                    'link' => $link
                ]);

                CreateThumbnailFromVideo::dispatch($room);
                ConvertVideoForStreaming::dispatch($room);

                $room->processing = true;
                $room->update();

                $user = User::find($request->user()->id);
                $user->room = $room->id;
                $user->link = $link;
                $user->update();

                return redirect()->route('room.home', [
                    'party' => $link
                ]);
            } else {
                return response()->json("File type is not acceptable", 500);
            }
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
        $user = User::find($request->user()->id);
        Storage::disk('upload-videos')->deleteDirectory($user->id);
        Storage::disk('secrets')->deleteDirectory($room->id);
        Storage::disk('videos')->deleteDirectory($room->id);
        $room->delete();
        $user->room = null;
        $user->link = null;
        $user->update();
        return redirect()->route('home');
    }

    public function videoPlaylist(Request $request, $playlist)
    {
        // $playlistName = $playlist . ".m3u8";
        // dd($room);
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
                // dd($playlistFilename);
                return route('video.playlist', [
                    'playlist' => $playlistFilename,
                    'rid' => $request->rid
                ]);
            });
    }

    public function videoKey(Request $request, $key)
    {
        // $room = Rooms::find($request->roomId);
        // dd($room);
        return Storage::disk('secrets')->download($request->rid . "/" . $key);
    }
}
