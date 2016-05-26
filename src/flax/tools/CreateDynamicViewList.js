/**
 * Created by long on 16/5/25.
 */
/**
 * 遍历project.json包含的所有js(不包括flax引擎)，将继承flax.MovieClip, flax.ListView的类
 * 用window['xxx']= xxx标注，并记录到src/__dynamicFlaxView.js中，防止高级混淆时出错
 * */