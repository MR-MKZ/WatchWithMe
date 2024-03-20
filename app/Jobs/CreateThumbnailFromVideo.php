<?php

namespace App\Jobs;

use App\Models\Rooms;
use FFMpeg\FFProbe;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg as FFMpeg;
use Storage;

class CreateThumbnailFromVideo implements ShouldQueue
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
//        $ffprobe = FFProbe::create();
//        $duration = $ffprobe->format(Storage::disk('upload-videos')->get("{$this->rooms->uid}/{$this->rooms->video}"))->get('duration');
//        $duration = explode(".", $duration)[0];
//        echo $duration;
        $path = "/{$this->rooms->id}/{$this->rooms->link}.png";
        FFMpeg::fromDisk('upload-videos')
            ->open("{$this->rooms->uid}/{$this->rooms->video}")
            ->getFrameFromSeconds(2)
            ->export()
            ->toDisk('videos')
            ->save($path);
    }
}
