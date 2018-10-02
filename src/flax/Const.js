/**
 * Created by long on 15/10/7.
 */

var VERSION = 2.6;
var MIN_TOOL_VERSION = 2.0;
/**
 * Default scale down for button when mouse down
 * */
var MOUSE_DOWN_SCALE = 0.95;
/**
 * Minimal mouse moved distance from mouse down to mouse up for mouse click determination
 * */
var MIN_DIST_FOR_CLICK = 10;

var RADIAN_TO_DEGREE = 180.0/Math.PI;
var DEGREE_TO_RADIAN = Math.PI/180.0;

var PTM_RATIO = 32;
var DEFAULT_SOUNDS_FOLDER = "res/music/";
//Reset animation frame to 0 when recycle
var RESET_FRAME_ON_RECYCLE = true;
var H_ALIGHS = ["left","center","right"];
var IMAGE_TYPES = [".png", ".jpg", ".bmp",".jpeg",".gif"];
var SOUND_TYPES = [".mp3", ".ogg", ".wav", ".mp4", ".m4a"];

var DATA_FORMAT = ".json";
var Y_DIRECTION = 1; //or -1 in cocos