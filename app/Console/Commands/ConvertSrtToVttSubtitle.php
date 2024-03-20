<?php

namespace App\Console\Commands;

use Captioning\Format\SubripFile;
use Illuminate\Console\Command;

class ConvertSrtToVttSubtitle extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'convert:subtitle';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command convert srt sub to vtt sub.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $srt = new SubripFile("storage/uploads/sub.srt");
        $srt->convertTo('webvtt')->save("storage/app/public/videos/sub.vtt");
    }
}
