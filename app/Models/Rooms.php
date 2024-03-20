<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rooms extends Model
{
    protected $fillable = ['title', 'video', 'type', 'link', 'uid'];
    use HasFactory;
}
