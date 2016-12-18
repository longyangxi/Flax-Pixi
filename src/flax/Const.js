/**
 * Created by long on 15/10/7.
 */

if(typeof FRAMEWORK == "undefined") FRAMEWORK = "cocos";

VERSION = 2.6;
MIN_TOOL_VERSION = 2.0;
/**
 * Default scale down for button when mouse down
 * */
MOUSE_DOWN_SCALE = 0.95;
/**
 * Minimal mouse moved distance from mouse down to mouse up for mouse click determination
 * */
MIN_DIST_FOR_CLICK = 10;

RADIAN_TO_DEGREE = 180.0/Math.PI;
DEGREE_TO_RADIAN = Math.PI/180.0;

PTM_RATIO = 32;
DEFAULT_SOUNDS_FOLDER = "res/music/";
//Reset animation frame to 0 when recycle
RESET_FRAME_ON_RECYCLE = true;
H_ALIGHS = ["left","center","right"];
IMAGE_TYPES = [".png", ".jpg", ".bmp",".jpeg",".gif"];
SOUND_TYPES = [".mp3", ".ogg", ".wav", ".mp4", ".m4a"];

DATA_FORMAT = FRAMEWORK == "cocos" ? ".plist" : ".json";
Y_DIRECTION = FRAMEWORK == "cocos" ? -1 : 1;