<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoomController;
use App\Models\Rooms;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Client\Request;
use Illuminate\Routing\RouteGroup;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Controllers\errorPagesController;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    $rooms = Rooms::where('processed', 1)->where('type', 'public')->get(['title', 'link', 'uid', 'id', 'duration']);
    $exportRooms = [];
    foreach ($rooms as $room) {
        array_push($exportRooms, [
            'id' => $room->id,
            'title' => $room->title,
            'link' => $room->link,
            'creator' => User::find($room->uid)->name,
            'duration' => $room->duration
        ]);
    }
    return Inertia::render('MainPage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'rooms' => $exportRooms
    ]);
})->name('home');

Route::get('/video/secret/{key}', [RoomController::class, 'videoKey'])->name('video.key');

Route::get('/video/{playlist}', [RoomController::class, 'videoPlaylist'])->name('video.playlist');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'admin'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.updatephoto');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // Room Handler Routes ------------------------------------------------------------------------
    Route::prefix('room')->group(function () {
        Route::get('/create', [RoomController::class, 'create'])->name('room.create');
        Route::post('/create', [RoomController::class, 'store']);
        Route::get('/join', [RoomController::class, 'join'])->name('room.home');
        Route::get('/processing_status', [RoomController::class, 'processingStatus']);
        Route::delete('/delete', [RoomController::class, 'deleteRoom'])->name('room.delete');
    });

    Route::prefix('upload')->group(function () {
        Route::post('/', [RoomController::class, 'uploadVideo'])->name('video.upload');
        Route::post('/complete', [RoomController::class, 'completeUpload'])->name('video.complete');
    });

});


require __DIR__ . '/auth.php';
