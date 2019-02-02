# 💎 glsl-canvas

[glsl-canvas-js](https://github.com/actarian/glsl-canvas) is a typescript porting of GlslCanvas, a javascript library that helps you easily load GLSL Fragment and Vertex Shaders into an HTMLCanvasElement. Originally made by [Patricio Gonzalez Vivo](http://patriciogonzalezvivo.com) author of [Book of Shaders](http://thebookofshaders.com) and [GlslEditor](http://editor.thebookofshaders.com).

## How to use

*With link*

Load the latest version of ```glsl-canvas.js``` on your page by adding this line to your HTML:
```html
<script type="text/javascript" src="https://rawgit.com/actarian/glsl-canvas/master/dist/glsl-canvas.min.js"></script>
```

*With npm*

If you are using npm package manager type this command on your terminal:

```bash
npm install glsl-canvas-js --save
```
___

*Run with html*

Add a canvas element on your page with class name ```glsl-canvas``` and assign a shader through a url using the ```data-fragment-url``` attribute.  
Or write your shader directly in code using the ```data-fragment``` attribute.

```html
<canvas class="glsl-canvas" data-fragment-url="fragment.glsl" width="500" height="500"></canvas>
```

`GlslCanvas` will automatically load a WebGL context in that ```<canvas>``` element, compile the shader and animate it for you.

### Run with javascript
 
Create a ```<canvas>``` element and attach a new instance of ```GlslCanvas```.

```javascript
let canvas = document.createElement('canvas');
let glsl = new GlslCanvas(canvas);
```

All the ```.glsl-canvas``` instances will be stored in the ```GlslCanvas.items``` array.
___

### Default Uniforms

These uniforms are automatically loaded for you.

| name           | |
|----------------|-|
| `u_time`       | a ```float``` representing elapsed time in seconds. |
| `u_resolution` | a ```vec2``` representing the dimensions of the viewport. |
| `u_mouse`      | a ```vec2``` representing the position of the mouse, defined in Javascript with ```.setMouse({x:[value],y:[value])```. |
| `u_texture_N`  | a ```sampler2D``` containing textures loaded with the ```data-textures``` attribute. |
___

### Attributes

| name                 | |
|----------------------|-|
| `data-fragment`      | load a fragment shader by providing the content of the shader as a string |
| `data-vertex`        | load a vertex shader by providing the content of the shader as a string |
| `data-fragment-url`  | load a fragment shader by providing a valid url |
| `data-vertex-url`    | load a vertex shader by providing a valid url |
| `data-textures`      | load a list of texture urls separated by commas (ex: ```data-textures="texture.jpg,normal_map.png,something.jpg"```). Textures will be assigned in order to ```uniform sampler2D``` variables with names following this style: ```u_tex0```, ```u_tex1```, ```u_tex2```, etc. |
| `controls`           | enable play on over functionality |
| `data-autoplay`      | enable autoplay with controls feature |
___

### Events

| name        | argument              |
|-------------|-----------------------|
| `load`      | GlslCanvas instance   |
| `render`    | GlslCanvas instance   |
| `over`      | MouseEvent            |
| `out`       | MouseEvent            |
| `move`      | { x:, y: }            |
| `click`     | MouseEvent            |
___

### Methods

| name          | parameters |
|---------------|-|
| `load`        | fragment: string, vertex: string |
| `on`          | eventName: string, callback: Function   |
| `setTexture`  | key: string, target: string or element, options:TextureOptions |
| `setUniform`  | key: string, ...values: number or string |
| `setUniforms` | uniforms: { [key: string]: number[] or string } |
| `play`        | |
| `pause`       | |
| `toggle`      | |
| `destroy`     | |
___

## Tips

You can change the content of the shader as many times you want. Here are some examples:

```javascript
// load only the fragment shader
let fragment = 'main() { gl_FragColor = vec4(1.0); }';
glsl.load(fragment);

// load a fragment and vertex shader
let vertex = 'attribute vec4 a_position; main(){ gl_Position = a_position; }';
glsl.load(fragment, vertex);
```

You can also send your custom uniforms to a shader with ```.setUniform('name', ...values)```. GlslCanvas will parse the value you provide to determine its type. If the value is a ```string```, GlslCanvas will parse it as the url of a texture.

```javascript

// assign .5 to 'uniform float u_brightness'
glsl.setUniform('u_brightness', 0.5); 

// assign (.2,.3) to 'uniform vec2 u_position'
glsl.setUniform('u_position', 0.2, 0.3);

// assign a red color to 'uniform vec3 u_color'
glsl.setUniform('u_color', 1.0, 0.0, 0.0); 

// load a new texture and assign it to 'uniform sampler2D u_texture'
glsl.setUniform('u_texture', 'data/texture.jpg');
```
___

### Examples

You can find some example to start at this [```page```](https://github.com/actarian/glsl-canvas/blob/master/docs/index.html).

Or you can see a live demo at this link [actarian.github.io/glsl-canvas/](https://actarian.github.io/glsl-canvas/)
___

### Collaborate 

If you'd like to contribute to this code, you need to:

* Install [node and npm](https://nodejs.org/download/) 
* Fork and clone [this repository](https://github.com/actarian/glsl-canvas)
```bash
git clone https://github.com/actarian/glsl-canvas.git
```
* Switch to glsl-canvas directory
```bash
cd glsl-canvas
```
* Install dependencies
```bash
npm install
```
* Run gulp for development and testing with livereload
```bash
gulp
```
* Build for production
```bash
gulp build --target dist
```
* Push to your local fork and make your pull request
___

*Pull requests are welcome and please submit bugs 🐞*

*Thank you for taking the time to provide feedback and review. This feedback is appreciated and very helpful 🌈*

[![GitHub forks](https://img.shields.io/github/forks/actarian/glsl-canvas.svg?style=social&label=Fork&maxAge=2592000)](https://gitHub.com/actarian/glsl-canvas/network/)  [![GitHub stars](https://img.shields.io/github/stars/actarian/glsl-canvas.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/actarian/glsl-canvas/stargazers/)  [![GitHub followers](https://img.shields.io/github/followers/actarian.svg?style=social&label=Follow&maxAge=2592000)](https://github.com/actarian?tab=followers)

* [Github Project Page](https://github.com/actarian/glsl-canvas)  

*If you find it helpful, feel free to contribute in keeping this extension up to date via [PayPal](https://www.paypal.me/circledev/5)*

[![PayPal](https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png)](https://www.paypal.me/circledev/5)
___

## Contact

* Luca Zampetti <lzampetti@gmail.com>
* Follow [@actarian](https://twitter.com/actarian) on Twitter

[![Twitter Follow](https://img.shields.io/twitter/follow/actarian.svg?style=social&label=Follow%20@actarian)](https://twitter.com/actarian)
___

## Release Notes
Changelog [here](https://github.com/actarian/glsl-canvas/blob/master/CHANGELOG.md).

---

### 0.1.0

* Initial release of glsl-canvas lib.
