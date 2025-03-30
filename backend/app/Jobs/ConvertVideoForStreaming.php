<?php

namespace App\Jobs;

use App\Models\Rooms;
use FFMpeg\Format\Video\X264;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;
use ProtoneMedia\LaravelFFMpeg\FFMpeg\FFProbe;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

class ConvertVideoForStreaming implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public $rooms;

    public function __construct(Rooms $rooms)
    {
        $this->rooms = $rooms;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $LDBitrate = (new X264('aac'))->setKiloBitrate(200);
        $SDBitrate = (new X264('aac'))->setKiloBitrate(400);
        $HDBitrate = (new X264('aac'))->setKiloBitrate(850);
        $FHDBitrate = (new X264('aac'))->setKiloBitrate(1500);

        $ffprobe = FFProbe::create();
        $video = $ffprobe->streams(Storage::disk("upload-videos")->path("{$this->rooms->uid}/{$this->rooms->video}"))->videos()->first();
        $duration = explode(".", $ffprobe->format(Storage::disk("upload-videos")->path("{$this->rooms->uid}/{$this->rooms->video}"))->get('duration'))[0];
        $this->rooms->duration = $duration;
        $this->rooms->update();
            
        $data = array(
            'width' => $video->get('width'),
            'height' => $video->get('height'),
            'bitrate' => intval($video->get('bit_rate') / 1024)
        );
        // $data = array(
        //     'width' => 1920,
        //     'height' => 1080,
        //     'bitrate' => 0
        // );
        $path = "/{$this->rooms->id}/{$this->rooms->link}.m3u8";

        if ($data['width'] >= 1920) {
            if ($data['bitrate'] != 0) {
                $FHDBitrate = (new X264('aac'))->setKiloBitrate($data['bitrate']);
            }
            FFMpeg::fromDisk('upload-videos')
                ->open("{$this->rooms->uid}/{$this->rooms->video}")
                ->exportForHLS()
                ->withRotatingEncryptionKey(function ($filename, $contents) {
                    Storage::disk('secrets')->put("{$this->rooms->id}/{$filename}", $contents);
                }, 20)
                ->addFormat($LDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=640:360', $out);
                    });
                })
                ->addFormat($SDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=854:480', $out);
                    });
                })
                ->addFormat($HDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=1280:720', $out);
                    });
                })
                ->addFormat($FHDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=1920:1080', $out);
                    });
                })
                ->onProgress(function ($progress) {
                    $this->rooms->process_percentage = $progress;
                    $this->rooms->update();
                })
                ->toDisk('videos')
                ->useSegmentFilenameGenerator(function ($name, $format, $key, callable $segments, callable $playlist) {
                    $segments("{$name}-{$format->getKiloBitrate()}-{$key}-%03d.ts");
                    $playlist("{$name}-{$format->getKiloBitrate()}-{$key}.m3u8");
                })
                ->save($path);
        } else if ($data['width'] >= 1280) {
            if ($data['bitrate'] != 0) {
                $HDBitrate = (new X264('aac'))->setKiloBitrate($data['bitrate']);
            }
            FFMpeg::fromDisk('upload-videos')
                ->open("{$this->rooms->uid}/{$this->rooms->video}")
                ->exportForHLS()
                ->withRotatingEncryptionKey(function ($filename, $contents) {
                    Storage::disk('secrets')->put("{$this->rooms->id}/{$filename}", $contents);
                }, 20)
                ->addFormat($LDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=640:360', $out);
                    });
                })
                ->addFormat($SDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=854:480', $out);
                    });
                })
                ->addFormat($HDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=1280:720', $out);
                    });
                })
                ->onProgress(function ($progress) {
                    $this->rooms->process_percentage = $progress;
                    $this->rooms->update();
                })
                ->toDisk('videos')
                ->useSegmentFilenameGenerator(function ($name, $format, $key, callable $segments, callable $playlist) {
                    $segments("{$name}-{$format->getKiloBitrate()}-{$key}-%03d.ts");
                    $playlist("{$name}-{$format->getKiloBitrate()}-{$key}.m3u8");
                })
                ->save($path);
        } else if ($data['width'] >= 854) {
            if ($data['bitrate'] != 0) {
                $SDBitrate = (new X264('aac'))->setKiloBitrate($data['bitrate']);
            }
            FFMpeg::fromDisk('upload-videos')
                ->open("{$this->rooms->uid}/{$this->rooms->video}")
                ->exportForHLS()
                ->withRotatingEncryptionKey(function ($filename, $contents) {
                    Storage::disk('secrets')->put("{$this->rooms->id}/{$filename}", $contents);
                }, 20)
                ->addFormat($LDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=640:360', $out);
                    });
                })
                ->addFormat($SDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=854:480', $out);
                    });
                })
                ->onProgress(function ($progress) {
                    $this->rooms->process_percentage = $progress;
                    $this->rooms->update();
                })
                ->toDisk('videos')
                ->useSegmentFilenameGenerator(function ($name, $format, $key, callable $segments, callable $playlist) {
                    $segments("{$name}-{$format->getKiloBitrate()}-{$key}-%03d.ts");
                    $playlist("{$name}-{$format->getKiloBitrate()}-{$key}.m3u8");
                })
                ->save($path);
        } else if ($data['width'] >= 640) {
            if ($data['bitrate'] != 0) {
                $LDBitrate = (new X264('aac'))->setKiloBitrate($data['bitrate']);
            }
            FFMpeg::fromDisk('upload-videos')
                ->open("{$this->rooms->uid}/{$this->rooms->video}")
                ->exportForHLS()
                ->withRotatingEncryptionKey(function ($filename, $contents) {
                    Storage::disk('secrets')->put("{$this->rooms->id}/{$filename}", $contents);
                }, 20)
                ->addFormat($LDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=640:360', $out);
                    });
                })
                ->onProgress(function ($progress) {
                    $this->rooms->process_percentage = $progress;
                    $this->rooms->update();
                })
                ->toDisk('videos')
                ->useSegmentFilenameGenerator(function ($name, $format, $key, callable $segments, callable $playlist) {
                    $segments("{$name}-{$format->getKiloBitrate()}-{$key}-%03d.ts");
                    $playlist("{$name}-{$format->getKiloBitrate()}-{$key}.m3u8");
                })
                ->save($path);
        } else {
            if ($data['bitrate'] != 0) {
                $LDBitrate = (new X264('aac'))->setKiloBitrate($data['bitrate']);
            }
            FFMpeg::fromDisk('upload-videos')
                ->open("{$this->rooms->uid}/{$this->rooms->video}")
                ->exportForHLS()
                ->withRotatingEncryptionKey(function ($filename, $contents) {
                    Storage::disk('secrets')->put("{$this->rooms->id}/{$filename}", $contents);
                }, 20)
                ->addFormat($LDBitrate, function ($media) {
                    $media->addFilter(function ($filters, $in, $out) {
                        $filters->custom($in, 'scale=640:360', $out);
                    });
                })
                ->onProgress(function ($progress) {
                    $this->rooms->process_percentage = $progress;
                    $this->rooms->update();
                })
                ->toDisk('videos')
                ->useSegmentFilenameGenerator(function ($name, $format, $key, callable $segments, callable $playlist) {
                    $segments("{$name}-{$format->getKiloBitrate()}-{$key}-%03d.ts");
                    $playlist("{$name}-{$format->getKiloBitrate()}-{$key}.m3u8");
                })
                ->save($path);
        }

        $this->rooms->processing = false;
        $this->rooms->processed = true;
        $this->rooms->update();
    }
}
