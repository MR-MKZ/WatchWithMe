<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use ProtoneMedia\LaravelFFMpeg\FFMpeg\FFProbe;

class ConvertVideo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'convert:video';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ffprobe = FFProbe::create();
        $video = $ffprobe->streams("storage/app/uploads/videos/1/Z4BxXrh3W9pqlpdkJDCaiYYgF2VadJZAQ728GY9IY1ujWmEW7O.mkv");
       
        // $data = array(
        //     'width' => $video->get('width'),
        //     'height' => $video->get('height'),
        //     'bitrate' => intval($video->get('bit_rate') / 1024)
        // );
        $arr = [];
        $data = [];
        foreach ($video as $stream) {
            array_push($arr, $stream);
        }
        $amm = $arr[3];
        foreach ($amm as $da) {
            print_r($da);
            array_push($data, $da);
        }
    }
}
