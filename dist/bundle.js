/**
 * A simple event system. Allows you to hook into Kontra lifecycle events or create your own, such as for [Plugins](api/plugin).
 *
 * ```js
 * import { on, off, emit } from 'kontra';
 *
 * function callback(a, b, c) {
 *   console.log({a, b, c});
 * });
 *
 * on('myEvent', callback);
 * emit('myEvent', 1, 2, 3);  //=> {a: 1, b: 2, c: 3}
 * off('myEvent', callback);
 * ```
 * @sectionName Events
 */

// expose for testing
let callbacks = {};

/**
 * Call all callback functions for the event. All arguments will be passed to the callback functions.
 * @function emit
 *
 * @param {String} event - Name of the event.
 * @param {...*} args - Comma separated list of arguments passed to all callbacks.
 */
function emit(event, ...args) {
  (callbacks[event] || []).map(fn => fn(...args));
}

/**
 * Functions for initializing the Kontra library and getting the canvas and context
 * objects.
 *
 * ```js
 * import { getCanvas, getContext, init } from 'kontra';
 *
 * let { canvas, context } = init();
 *
 * // or can get canvas and context through functions
 * canvas = getCanvas();
 * context = getContext();
 * ```
 * @sectionName Core
 */

let canvasEl, context;

/**
 * Return the context object.
 * @function getContext
 *
 * @returns {CanvasRenderingContext2D} The context object the game draws to.
 */
function getContext() {
  return context;
}

/**
 * Initialize the library and set up the canvas. Typically you will call `init()` as the first thing and give it the canvas to use. This will allow all Kontra objects to reference the canvas when created.
 *
 * ```js
 * import { init } from 'kontra';
 *
 * let { canvas, context } = init('game');
 * ```
 * @function init
 *
 * @param {String|HTMLCanvasElement} [canvas] - The canvas for Kontra to use. Can either be the ID of the canvas element or the canvas element itself. Defaults to using the first canvas element on the page.
 *
 * @returns {{canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}} An object with properties `canvas` and `context`. `canvas` it the canvas element for the game and `context` is the context object the game draws to.
 */
function init(canvas) {

  // check if canvas is a string first, an element next, or default to getting
  // first canvas on page
  canvasEl = document.getElementById(canvas) ||
             canvas ||
             document.querySelector('canvas');


  context = canvasEl.getContext('2d');
  context.imageSmoothingEnabled = false;

  emit('init');

  return { canvas: canvasEl, context };
}

// noop function
const noop = () => {};

/**
 * Rotate a point by an angle.
 * @function rotatePoint
 *
 * @param {{x: Number, y: Number}} point - The point to rotate.
 * @param {Number} angle - Angle (in radians) to rotate.
 *
 * @returns {{x: Number, y: Number}} The new x and y coordinates after rotation.
 */
function rotatePoint(point, angle) {
  let sin = Math.sin(angle);
  let cos = Math.cos(angle);
  let x = point.x * cos - point.y * sin;
  let y = point.x * sin + point.y * cos;

  return {x, y};
}

/**
 * Clamp a number between two values, preventing it from going below or above the minimum and maximum values.
 * @function clamp
 *
 * @param {Number} min - Min value.
 * @param {Number} max - Max value.
 * @param {Number} value - Value to clamp.
 *
 * @returns {Number} Value clamped between min and max.
 */
function clamp(min, max, value) {
  return Math.min( Math.max(min, value), max );
}

/**
 * A simple 2d vector object.
 *
 * ```js
 * import { Vector } from 'kontra';
 *
 * let vector = Vector(100, 200);
 * ```
 * @class Vector
 *
 * @param {Number} [x=0] - X coordinate of the vector.
 * @param {Number} [y=0] - Y coordinate of the vector.
 */
class Vector {
  constructor(x = 0, y = 0, vec = {}) {
    this.x = x;
    this.y = y;

  }

  /**
   * Calculate the addition of the current vector with the given vector.
   * @memberof Vector
   * @function add
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to add to the current Vector.
   *
   * @returns {Vector} A new Vector instance whose value is the addition of the two vectors.
   */
  add(vec) {
    return new Vector(
      this.x + vec.x,
      this.y + vec.y,
      this
    );
  }








}

function factory$1() {
  return new Vector(...arguments);
}
factory$1.prototype = Vector.prototype;
factory$1.class = Vector;

/**
 * This is a private class that is used just to help make the GameObject class more manageable and smaller.
 *
 * It maintains everything that can be changed in the update function:
 * position
 * velocity
 * acceleration
 * ttl
 */
class Updatable {

  constructor(properties) {
    return this.init(properties);
  }

  init(properties = {}) {

    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The game objects position vector. Represents the local position of the object as opposed to the [world](/api/gameObject#world) position.
     * @property {Vector} position
     * @memberof GameObject
     * @page GameObject
     */
    this.position = factory$1();

    // --------------------------------------------------
    // optionals
    // --------------------------------------------------

    /**
     * The game objects velocity vector.
     * @memberof GameObject
     * @property {Vector} velocity
     * @page GameObject
     */
    this.velocity = factory$1();



    // add all properties to the object, overriding any defaults
    Object.assign(this, properties);
  }

  /**
   * Update the game objects position based on its velocity and acceleration. Calls the game objects [advance()](api/gameObject#advance) function.
   * @memberof GameObject
   * @function update
   * @page GameObject
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    this.advance(dt);
  }

  /**
   * Move the game object by its acceleration and velocity. If you pass `dt` it will multiply the vector and acceleration by that number. This means the `dx`, `dy`, `ddx` and `ddy` should be the how far you want the object to move in 1 second rather than in 1 frame.
   *
   * If you override the game objects [update()](api/gameObject#update) function with your own update function, you can call this function to move the game object normally.
   *
   * ```js
   * import { GameObject } from 'kontra';
   *
   * let gameObject = GameObject({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   dx: 5,
   *   dy: 2,
   *   update: function() {
   *     // move the game object normally
   *     this.advance();
   *
   *     // change the velocity at the edges of the canvas
   *     if (this.x < 0 ||
   *         this.x + this.width > this.context.canvas.width) {
   *       this.dx = -this.dx;
   *     }
   *     if (this.y < 0 ||
   *         this.y + this.height > this.context.canvas.height) {
   *       this.dy = -this.dy;
   *     }
   *   }
   * });
   * ```
   * @memberof GameObject
   * @function advance
   * @page GameObject
   *
   * @param {Number} [dt] - Time since last update.
   *
   */
  advance(dt) {

    let velocity = this.velocity;


    this.position = this.position.add(velocity);
    this._pc();

  }

  // --------------------------------------------------
  // velocity
  // --------------------------------------------------

  /**
   * X coordinate of the velocity vector.
   * @memberof GameObject
   * @property {Number} dx
   * @page GameObject
   */
  get dx() {
    return this.velocity.x;
  }

  /**
   * Y coordinate of the velocity vector.
   * @memberof GameObject
   * @property {Number} dy
   * @page GameObject
   */
  get dy() {
    return this.velocity.y;
  }

  set dx(value) {
    this.velocity.x = value;
  }

  set dy(value) {
    this.velocity.y = value;
  }

  // --------------------------------------------------
  // acceleration
  // --------------------------------------------------


  // --------------------------------------------------
  // ttl
  // --------------------------------------------------


  _pc() {}
}

/**
 * The base class of most renderable classes. Handles things such as position, rotation, anchor, and the update and render life cycle.
 *
 * Typically you don't create a GameObject directly, but rather extend it for new classes.
 * @class GameObject
 *
 * @param {Object} [properties] - Properties of the game object.
 * @param {Number} [properties.x] - X coordinate of the position vector.
 * @param {Number} [properties.y] - Y coordinate of the position vector.
 * @param {Number} [properties.width] - Width of the game object.
 * @param {Number} [properties.height] - Height of the game object.
 *
 * @param {CanvasRenderingContext2D} [properties.context] - The context the game object should draw to. Defaults to [core.getContext()](api/core#getContext).
 *
 * @param {Number} [properties.dx] - X coordinate of the velocity vector.
 * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
 * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
 * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
 * @param {Number} [properties.ttl=Infinity] - How many frames the game object should be alive. Used by [Pool](api/pool).
 *
 * @param {{x: number, y: number}} [properties.anchor={x:0,y:0}] - The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
 * @param {Number} [properties.sx=0] - The x camera position.
 * @param {Number} [properties.sy=0] - The y camera position.
 * @param {GameObject[]} [properties.children] - Children to add to the game object.
 * @param {Number} [properties.opacity=1] - The opacity of the game object.
 * @param {Number} [properties.rotation=0] - The rotation around the anchor in radians.
 * @param {Number} [properties.scaleX=1] - The x scale of the game object.
 * @param {Number} [properties.scaleY=1] - The y scale of the game object.
 *
 * @param {(dt?: number) => void} [properties.update] - Function called every frame to update the game object.
 * @param {Function} [properties.render] - Function called every frame to render the game object.
 *
 * @param {...*} properties.props - Any additional properties you need added to the game object. For example, if you pass `gameObject({type: 'player'})` then the game object will also have a property of the same name and value. You can pass as many additional properties as you want.
 */
class GameObject extends Updatable {
  /**
   * @docs docs/api_docs/gameObject.js
   */

  /**
   * Use this function to reinitialize a game object. It takes the same properties object as the constructor. Useful it you want to repurpose a game object.
   * @memberof GameObject
   * @function init
   *
   * @param {Object} properties - Properties of the game object.
   */
  init({

    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The width of the game object. Represents the local width of the object as opposed to the [world](/api/gameObject#world) width.
     * @memberof GameObject
     * @property {Number} width
     */
    width = 0,

    /**
     * The height of the game object. Represents the local height of the object as opposed to the [world](/api/gameObject#world) height.
     * @memberof GameObject
     * @property {Number} height
     */
    height = 0,

    /**
     * The context the game object will draw to.
     * @memberof GameObject
     * @property {CanvasRenderingContext2D} context
     */
    context = getContext(),

    render = this.draw,
    update = this.advance,

    // --------------------------------------------------
    // optionals
    // --------------------------------------------------


    /**
     * The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
     * @memberof GameObject
     * @property {{x: number, y: number}} anchor
     *
     * @example
     * // exclude-code:start
     * let { GameObject } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { GameObject } from 'kontra';
     * // exclude-script:end
     *
     * let gameObject = GameObject({
     *   x: 150,
     *   y: 100,
     *   width: 50,
     *   height: 50,
     *   color: 'red',
     *   // exclude-code:start
     *   context: context,
     *   // exclude-code:end
     *   render: function() {
     *     this.context.fillStyle = this.color;
     *     this.context.fillRect(0, 0, this.height, this.width);
     *   }
     * });
     *
     * function drawOrigin(gameObject) {
     *   gameObject.context.fillStyle = 'yellow';
     *   gameObject.context.beginPath();
     *   gameObject.context.arc(gameObject.x, gameObject.y, 3, 0, 2*Math.PI);
     *   gameObject.context.fill();
     * }
     *
     * gameObject.render();
     * drawOrigin(gameObject);
     *
     * gameObject.anchor = {x: 0.5, y: 0.5};
     * gameObject.x = 300;
     * gameObject.render();
     * drawOrigin(gameObject);
     *
     * gameObject.anchor = {x: 1, y: 1};
     * gameObject.x = 450;
     * gameObject.render();
     * drawOrigin(gameObject);
     */
    anchor = {x: 0, y: 0},



    /**
     * The rotation of the game object around the anchor in radians. . Represents the local rotation of the object as opposed to the [world](/api/gameObject#world) rotation.
     * @memberof GameObject
     * @property {Number} rotation
     */
    rotation = 0,


    ...props
  } = {}) {


    // by setting defaults to the parameters and passing them into
    // the init, we can ensure that a parent class can set overriding
    // defaults and the GameObject won't undo it (if we set
    // `this.width` then no parent could provide a default value for
    // width)
    super.init({
      width,
      height,
      context,

      anchor,



      rotation,


      ...props
    });

    // di = done init
    this._di = true;
    this._uw();


    // rf = render function
    this._rf = render;

    // uf = update function
    this._uf = update;
  }

  /**
   * Render the game object. Calls the game objects [draw()](api/gameObject#draw) function.
   * @memberof GameObject
   * @function render
   *
   * @param {Function} [filterObjects] - [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) function which is used to filter which children to render.
   */
  render(filterObjects) {
    let context = this.context;
    context.save();

    // 1) translate to position
    //
    // it's faster to only translate if one of the values is non-zero
    // rather than always translating
    // @see https://jsperf.com/translate-or-if-statement/2
    if (this.x || this.y) {
      context.translate(this.x, this.y);
    }

    // 2) rotate around the anchor
    //
    // it's faster to only rotate when set rather than always rotating
    // @see https://jsperf.com/rotate-or-if-statement/2
    if (this.rotation) {
      context.rotate(this.rotation);
    }



    // 5) translate to the anchor so (0,0) is the top left corner
    // for the render function
    let anchorX = -this.width * this.anchor.x;
    let anchorY = -this.height * this.anchor.y;

    if (anchorX || anchorY) {
      context.translate(anchorX, anchorY);
    }


    this._rf();

    // 7) translate back to the anchor so children use the correct
    // x/y value from the anchor
    if (anchorX || anchorY) {
      context.translate(-anchorX, -anchorY);
    }


    context.restore();
  }

  /**
   * Draw the game object at its X and Y position, taking into account rotation, scale, and anchor.
   *
   * Do note that the canvas has been rotated and translated to the objects position (taking into account anchor), so {0,0} will be the top-left corner of the game object when drawing.
   *
   * If you override the game objects `render()` function with your own render function, you can call this function to draw the game object normally.
   *
   * ```js
   * let { GameObject } = kontra;
   *
   * let gameObject = GameObject({
   *  x: 290,
   *  y: 80,
   *  width: 20,
   *  height: 40,
   *
   *  render: function() {
   *    // draw the game object normally (perform rotation and other transforms)
   *    this.draw();
   *
   *    // outline the game object
   *    this.context.strokeStyle = 'yellow';
   *    this.context.lineWidth = 2;
   *    this.context.strokeRect(0, 0, this.width, this.height);
   *  }
   * });
   *
   * gameObject.render();
   * ```
   * @memberof GameObject
   * @function draw
   */
  draw() {}

  /**
   * Sync property changes from the parent to the child
   */
  _pc(prop, value) {
    this._uw();

  }

  /**
   * X coordinate of the position vector.
   * @memberof GameObject
   * @property {Number} x
   */
  get x() {
    return this.position.x;
  }

  /**
   * Y coordinate of the position vector.
   * @memberof GameObject
   * @property {Number} y
   */
  get y() {
    return this.position.y;
  }

  set x(value) {
    this.position.x = value;

    // pc = property changed
    this._pc();
  }

  set y(value) {
    this.position.y = value;
    this._pc();
  }

  get width() {
    // w = width
    return this._w;
  }

  set width(value) {
    this._w = value;
    this._pc();
  }

  get height() {
    // h = height
    return this._h;
  }

  set height(value) {
    this._h = value;
    this._pc();
  }

  /**
   * Update world properties
   */
  _uw() {
    // don't update world properties until after the init has finished
    if (!this._di) return;

    let {
      _wx = 0,
      _wy = 0,


      _wr = 0,

    } = (this.parent || {});

    // wx = world x, wy = world y
    this._wx = this.x;
    this._wy = this.y;

    // ww = world width, wh = world height
    this._ww = this.width;
    this._wh = this.height;


    // wr = world rotation
    this._wr = _wr + this.rotation;

    let {x, y} = rotatePoint({x: this.x, y: this.y}, _wr);
    this._wx = x;
    this._wy = y;


  }

  /**
   * The world position, width, height, opacity, rotation, and scale. The world property is the true position, width, height, etc. of the object, taking into account all parents.
   * @property {{x: number, y: number, width: number, height: number, opacity: number, rotation: number, scaleX: number, scaleY: number}} world
   * @memberof GameObject
   */
  get world() {
    return {
      x: this._wx,
      y: this._wy,
      width: this._ww,
      height: this._wh,


      rotation: this._wr,

    }
  }

  // --------------------------------------------------
  // group
  // --------------------------------------------------


  // --------------------------------------------------
  // opacity
  // --------------------------------------------------


  // --------------------------------------------------
  // rotation
  // --------------------------------------------------

  get rotation() {
    return this._rot;
  }

  set rotation(value) {
    this._rot = value;
    this._pc();
  }

  // --------------------------------------------------
  // scale
  // --------------------------------------------------

}

function factory$2() {
  return new GameObject(...arguments);
}
factory$2.prototype = GameObject.prototype;
factory$2.class = GameObject;

/**
 * A versatile way to update and draw your sprites. It can handle simple rectangles, images, and sprite sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
 * @class Sprite
 * @extends GameObject
 *
 * @param {Object} [properties] - Properties of the sprite.
 * @param {String} [properties.color] - Fill color for the game object if no image or animation is provided.
 * @param {HTMLImageElement|HTMLCanvasElement} [properties.image] - Use an image to draw the sprite.
 * @param {Object} [properties.animations] - An object of [Animations](api/animation) from a [Spritesheet](api/spriteSheet) to animate the sprite.
 */
class Sprite extends factory$2.class {
  /**
   * @docs docs/api_docs/sprite.js
   */

  init({
    /**
     * The color of the game object if it was passed as an argument.
     * @memberof Sprite
     * @property {String} color
     */


    ...props
  } = {}) {
    super.init({
      ...props
    });
  }


  draw() {


    if (this.color) {
      this.context.fillStyle = this.color;
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }
}

function factory$3() {
  return new Sprite(...arguments);
}
factory$3.prototype = Sprite.prototype;
factory$3.class = Sprite;

let fontSizeRegex = /(\d+)(\w+)/;

function parseFont(font) {
  let match = font.match(fontSizeRegex);

  // coerce string to number
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
  let size = +match[1];
  let unit = match[2];
  let computed = size;

  // compute font size
  // switch(unit) {
  //   // px defaults to the size

  //   // em uses the size of the canvas when declared (but won't keep in sync with
  //   // changes to the canvas font-size)
  //   case 'em': {
  //     let fontSize = window.getComputedStyle(getCanvas()).fontSize;
  //     let parsedSize = parseFont(fontSize).size;
  //     computed = size * parsedSize;
  //   }

  //   // rem uses the size of the HTML element when declared (but won't keep in
  //   // sync with changes to the HTML element font-size)
  //   case 'rem': {
  //     let fontSize = window.getComputedStyle(document.documentElement).fontSize;
  //     let parsedSize = parseFont(fontSize).size;
  //     computed = size * parsedSize;
  //   }
  // }

  return {
    size,
    unit,
    computed
  };
}

/**
 * An object for drawing text to the screen. Supports newline characters as well as automatic new lines when setting the `width` property.
 *
 * You can also display RTL languages by setting the attribute `dir="rtl"` on the main canvas element. Due to the limited browser support for individual text to have RTL settings, it must be set globally for the entire game.
 *
 * @example
 * // exclude-code:start
 * let { Text } = kontra;
 * // exclude-code:end
 * // exclude-script:start
 * import { Text } from 'kontra';
 * // exclude-script:end
 *
 * let text = Text({
 *   text: 'Hello World!\nI can even be multiline!',
 *   font: '32px Arial',
 *   color: 'white',
 *   x: 300,
 *   y: 100,
 *   anchor: {x: 0.5, y: 0.5},
 *   textAlign: 'center'
 * });
 * // exclude-code:start
 * text.context = context;
 * // exclude-code:end
 *
 * text.render();
 * @class Text
 * @extends GameObject
 *
 * @param {Object} properties - Properties of the text.
 * @param {String} properties.text - The text to display.
 * @param {String} [properties.font] - The [font](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) style. Defaults to the main context font.
 * @param {String} [properties.color] - Fill color for the text. Defaults to the main context fillStyle.
 * @param {Number} [properties.width] - Set a fixed width for the text. If set, the text will automatically be split into new lines that will fit the size when possible.
 * @param {String} [properties.textAlign='left'] - The [textAlign](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign) for the context. If the `dir` attribute is set to `rtl` on the main canvas, the text will automatically be aligned to the right, but you can override that by setting this property.
 * @param {Number} [properties.lineHeight=1] - The distance between two lines of text.
 */
class Text extends factory$2.class {

  init({

    // --------------------------------------------------
    // defaults
    // --------------------------------------------------

    /**
     * The string of text. Use newline characters to create multi-line strings.
     * @memberof Text
     * @property {String} text
     */
    text = '',

    /**
     * The text alignment.
     * @memberof Text
     * @property {String} textAlign
     */
    textAlign = '',

    /**
     * The distance between two lines of text. The value is multiplied by the texts font size.
     * @memberof Text
     * @property {Number} lineHeight
     */
    lineHeight = 1,

   /**
    * The font style.
    * @memberof Text
    * @property {String} font
    */
    font = getContext().font,

    /**
     * The color of the text.
     * @memberof Text
     * @property {String} color
     */

     ...props
  } = {}) {
    super.init({
      text,
      textAlign,
      lineHeight,
      font,
      ...props
    });

    // p = prerender
    this._p();
  }

  // keep width and height getters/settings so we can set _w and _h and not
  // trigger infinite call loops
  get width() {
    // w = width
    return this._w;
  }

  set width(value) {
    // d = dirty
    this._d = true;
    this._w = value;

    // fw = fixed width
    this._fw = value;
  }

  get text() {
    return this._t;
  }

  set text(value) {
    this._d = true;
    this._t = value;
  }

  get font() {
    return this._f;
  }

  set font(value) {
    this._d = true;
    this._f = value;
    this._fs = parseFont(value).computed;
  }

  get lineHeight() {
    // lh = line height
    return this._lh;
  }

  set lineHeight(value) {
    this._d = true;
    this._lh = value;
  }

  render() {
    if (this._d) {
      this._p();
    }
    super.render();
  }

  /**
   * Calculate the font width, height, and text strings before rendering.
   */
  _p() {
    // s = strings
    this._s = [];
    this._d = false;
    let context = this.context;

    context.font = this.font;



    if (!this._s.length) {
      this._s.push(this.text);
      this._w = this._fw || context.measureText(this.text).width;
    }

    this.height = this._fs + ((this._s.length - 1) * this._fs * this.lineHeight);
    this._uw();
  }

  draw() {
    let alignX = 0;
    let textAlign = this.textAlign;
    let context = this.context;



    this._s.map((str, index) => {
      context.textBaseline = 'top';
      context.textAlign = textAlign;
      context.fillStyle = this.color;
      context.font = this.font;
      context.fillText(str, alignX, this._fs * this.lineHeight * index);
    });
  }
}

function factory$4() {
  return new Text(...arguments);
}
factory$4.prototype = Text.prototype;
factory$4.class = Text;

/**
 * Clear the canvas.
 */
function clear(context) {
  let canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * The game loop updates and renders the game every frame. The game loop is stopped by default and will not start until the loops `start()` function is called.
 *
 * The game loop uses a time-based animation with a fixed `dt` to [avoid frame rate issues](http://blog.sklambert.com/using-time-based-animation-implement/). Each update call is guaranteed to equal 1/60 of a second.
 *
 * This means that you can avoid having to do time based calculations in your update functions and instead do fixed updates.
 *
 * ```js
 * import { Sprite, GameLoop } from 'kontra';
 *
 * let sprite = Sprite({
 *   x: 100,
 *   y: 200,
 *   width: 20,
 *   height: 40,
 *   color: 'red'
 * });
 *
 * let loop = GameLoop({
 *   update: function(dt) {
 *     // no need to determine how many pixels you want to
 *     // move every second and multiple by dt
 *     // sprite.x += 180 * dt;
 *
 *     // instead just update by how many pixels you want
 *     // to move every frame and the loop will ensure 60FPS
 *     sprite.x += 3;
 *   },
 *   render: function() {
 *     sprite.render();
 *   }
 * });
 *
 * loop.start();
 * ```
 * @class GameLoop
 *
 * @param {Object} properties - Properties of the game loop.
 * @param {(dt?: Number) => void} [properties.update] - Function called every frame to update the game. Is passed the fixed `dt` as a parameter.
 * @param {Function} properties.render - Function called every frame to render the game.
 * @param {Number}   [properties.fps=60] - Desired frame rate.
 * @param {Boolean}  [properties.clearCanvas=true] - Clear the canvas every frame before the `render()` function is called.
 * @param {CanvasRenderingContext2D} [properties.context] - The context that should be cleared each frame if `clearContext` is not set to `false`. Defaults to [core.getContext()](api/core#getContext).
 */
function GameLoop({
  fps = 60,
  clearCanvas = true,
  update = noop,
  render,
  context = getContext()
} = {}) {
  // check for required functions

  // animation variables
  let accumulator = 0;
  let delta = 1E3 / fps;  // delta between performance.now timings (in ms)
  let step = 1 / fps;
  let clearFn = clearCanvas ? clear : noop;
  let last, rAF, now, dt, loop;

  /**
   * Called every frame of the game loop.
   */
  function frame() {
    rAF = requestAnimationFrame(frame);

    now = performance.now();
    dt = now - last;
    last = now;

    // prevent updating the game with a very large dt if the game were to lose focus
    // and then regain focus later
    if (dt > 1E3) {
      return;
    }

    emit('tick');
    accumulator += dt;

    while (accumulator >= delta) {
      loop.update(step);

      accumulator -= delta;
    }

    clearFn(context);
    loop.render();
  }

  // game loop object
  loop = {
    /**
     * Called every frame to update the game. Put all of your games update logic here.
     * @memberof GameLoop
     * @function update
     *
     * @param {Number} [dt] - The fixed dt time of 1/60 of a frame.
     */
    update,

    /**
     * Called every frame to render the game. Put all of your games render logic here.
     * @memberof GameLoop
     * @function render
     */
    render,

    /**
     * If the game loop is currently stopped.
     *
     * ```js
     * import { GameLoop } from 'kontra';
     *
     * let loop = GameLoop({
     *   // ...
     * });
     * console.log(loop.isStopped);  //=> true
     *
     * loop.start();
     * console.log(loop.isStopped);  //=> false
     *
     * loop.stop();
     * console.log(loop.isStopped);  //=> true
     * ```
     * @memberof GameLoop
     * @property {Boolean} isStopped
     */
    isStopped: true,

    /**
     * Start the game loop.
     * @memberof GameLoop
     * @function start
     */
    start() {
      last = performance.now();
      this.isStopped = false;
      requestAnimationFrame(frame);
    },

    /**
     * Stop the game loop.
     * @memberof GameLoop
     * @function stop
     */
    stop() {
      this.isStopped = true;
      cancelAnimationFrame(rAF);
    },

    // expose properties for testing
  };

  return loop;
}

/**
 * A minimalistic keyboard API. You can use it move the main sprite or respond to a key press.
 *
 * ```js
 * import { initKeys, keyPressed } from 'kontra';
 *
 * // this function must be called first before keyboard
 * // functions will work
 * initKeys();
 *
 * function update() {
 *   if (keyPressed('left')) {
 *     // move left
 *   }
 * }
 * ```
 * @sectionName Keyboard
 */

/**
 * Below is a list of keys that are provided by default. If you need to extend this list, you can use the [keyMap](api/keyboard#keyMap) property.
 *
 * - a-z
 * - 0-9
 * - enter, esc, space, left, up, right, down
 * @sectionName Available Keys
 */

let callbacks$2 = {};
let pressedKeys = {};

/**
 * A map of keycodes to key names. Add to this object to expand the list of [available keys](api/keyboard#available-keys).
 *
 * ```js
 * import { keyMap, bindKeys } from 'kontra';
 *
 * keyMap[34] = 'pageDown';
 *
 * bindKeys('pageDown', function(e) {
 *   // handle pageDown key
 * });
 * ```
 * @property {{[key in (String|Number)]: string}} keyMap
 */
let keyMap = {
  // named keys
  'Enter': 'enter',
  'Escape': 'esc',
  'Space': 'space',
  'ArrowLeft': 'left',
  'ArrowUp': 'up',
  'ArrowRight': 'right',
  'ArrowDown': 'down'
};

/**
 * Execute a function that corresponds to a keyboard key.
 *
 * @param {KeyboardEvent} evt
 */
function keydownEventHandler(evt) {
  let key = keyMap[evt.code];
  pressedKeys[key] = true;

  if (callbacks$2[key]) {
    callbacks$2[key](evt);
  }
}

/**
 * Set the released key to not being pressed.
 *
 * @param {KeyboardEvent} evt
 */
function keyupEventHandler(evt) {
  pressedKeys[ keyMap[evt.code] ] = false;
}

/**
 * Reset pressed keys.
 */
function blurEventHandler$1() {
  pressedKeys = {};
}

/**
 * Initialize keyboard event listeners. This function must be called before using other keyboard functions.
 * @function initKeys
 */
function initKeys() {
  let i;

  // alpha keys
  // @see https://stackoverflow.com/a/43095772/2124254
  for (i = 0; i < 26; i++) {
    // rollupjs considers this a side-effect (for now), so we'll do it in the
    // initKeys function
    keyMap[i + 65] = keyMap['Key' + String.fromCharCode(i + 65)] = String.fromCharCode(i + 97);
  }

  // numeric keys
  for (i = 0; i < 10; i++) {
    keyMap[48+i] = keyMap['Digit'+i] = ''+i;
  }

  window.addEventListener('keydown', keydownEventHandler);
  window.addEventListener('keyup', keyupEventHandler);
  window.addEventListener('blur', blurEventHandler$1);
}

/**
 * Check if a key is currently pressed. Use during an `update()` function to perform actions each frame.
 *
 * ```js
 * import { Sprite, initKeys, keyPressed } from 'kontra';
 *
 * initKeys();
 *
 * let sprite = Sprite({
 *   update: function() {
 *     if (keyPressed('left')){
 *       // left arrow pressed
 *     }
 *     else if (keyPressed('right')) {
 *       // right arrow pressed
 *     }
 *
 *     if (keyPressed('up')) {
 *       // up arrow pressed
 *     }
 *     else if (keyPressed('down')) {
 *       // down arrow pressed
 *     }
 *   }
 * });
 * ```
 * @function keyPressed
 *
 * @param {String} key - Key to check for pressed state.
 *
 * @returns {Boolean} `true` if the key is pressed, `false` otherwise.
 */
function keyPressed(key) {
  return !!pressedKeys[key];
}

const distanceToTarget = (source, target) => Math.sqrt(Math.pow(source.x - target.x, 2) + Math.pow(source.y - target.y, 2));
const pointInRect = ({ x, y }, { x: x1, y: y1, width, height }) =>
  x > x1 - width / 2 && x < x1 + width / 2 && y > y1 - height / 2 && y < y1 + height / 2;

const distance = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
const angleToTarget = (source, target) => Math.atan2(target.y - source.y, target.x - source.x) + Math.PI / 2;
const text = {
  fireRateUpdated: 'Fire Rate Upgrade',
  maxSpeed: 'Speed Upgrade',
  repair: 'Hull Repaired',
  warpDrive: 'Warp Drive Fixed, Warping in 3, 2, 1...'
  // secondaryWeapon: 'Secondary Weapon Online'
};
const seedRand = function(s) {
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};
// Test [...Array(to).keys()] compatibility
// eslint-disable-next-line prefer-spread
const range = to => Array.apply(null, Array(to)).map((x, i) => i);

class StarField extends factory$2.class {
  constructor(properties) {
    super(properties);
  }

  draw() {
    const ctx = this.context;
    ctx.fillStyle = '#000';
    ctx.fillRect(-this.x, -this.y, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#fff';
    range(Math.floor(ctx.canvas.width * ctx.canvas.height * 0.0001)).forEach(i =>
      ctx.fillRect(
        -this.x + ((this.x + (Math.pow(i, 3) * 2 + i * 20)) % ctx.canvas.width),
        -this.y + ((this.y + (Math.pow(i, 3) * 2 + i * 20)) % ctx.canvas.height),
        (i % 3) + 1,
        (i % 3) + 1
      )
    );
  }
}
/* Twinkle

    for(let i = 0; i < 150; i++){
      this.context.fillRect(
        -this.x+(Math.abs((Math.pow(this.x+i, 3)*2+(this.y+i)*20))%this.context.canvas.width),
        -this.y+(Math.abs((Math.pow(this.y+i, 3)*2+(this.x+i)*20))%this.context.canvas.height), 2, 2)
    }
*/

const pad = 20;
const fontSize = 24;
const font = `${fontSize}px Arial`;
const color = '#fff';
const textAlign = 'right';
const fontProps = {
  font,
  color,
  textAlign
};
class Cockpit extends factory$2.class {
  queue = [];
  showTitleText = true;
  showSkipHelper = false;
  constructor(props) {
    super(props);
    const _this = this;
    _this.dayText = new factory$4(fontProps);
    _this.scrapText = new factory$4(fontProps);
    _this.healthText = new factory$4(fontProps);
    _this.skipHelper = new factory$4({ font: `12px Arial`, color, text: 'Press SPACE to skip' });
    _this.statusTextBackground = new factory$3({ color: '#6009' });
  }
  setSkipHelper(on) {
    this.showSkipHelper = on;
  }

  render() {
    const _this = this;
    _this.dayText.render();
    _this.scrapText.render();
    _this.healthText.render();
    if (_this.statusText) {
      _this.statusTextBackground.render();
      _this.statusText.render();
      if (_this.showSkipHelper) _this.skipHelper.render();
    }
  }
  addStatus(text, time = 6000) {
    this.queue.push([text, time]);
    if (!this.statusText) this.getNextStatus();
  }
  getNextStatus() {
    clearTimeout(this.timer);
    if (this.queue.length > 0) {
      const [text, time] = this.queue.shift();
      this.statusText = new factory$4({
        font,
        color,
        text,
        textAlign: 'center',
        x: this.context.canvas.width / 2,
        y: pad
      });
      this.timer = setTimeout(() => this.getNextStatus(), time);
    } else this.statusText = null;
  }
  update(ship) {
    const _this = this;
    const w = _this.context.canvas.width;
    const h = _this.context.canvas.height;
    _this.dayText.x = w - pad;
    _this.dayText.y = h - pad - fontSize;
    _this.scrapText.x = w - pad;
    _this.scrapText.y = h - 45 - pad - fontSize;
    _this.healthText.x = w - pad;
    _this.healthText.y = h - 90 - pad - fontSize;
    _this.scrapText.text = `Scrap: ${ship.scrap}t`;
    _this.dayText.text = `Day: ${ship.day}`;
    _this.healthText.text = `Hull Integrity: ${ship.health}%`;
    if (_this.statusText) {
      _this.statusTextBackground.width = w;
      _this.statusTextBackground.height = fontSize + pad * 2;
      _this.statusText.x = w / 2;
      _this.statusText.y = pad;
      if (_this.showSkipHelper) {
        _this.skipHelper.x = w / 2 + 150;
        _this.skipHelper.y = pad * 2 + 7;
      }
    }
  }
}

class Bullet extends factory$3.class {
  constructor(properties) {
    properties = { ...properties, width: 2, height: 10, color: '#abab46', hit: false };
    super(properties);
  }
  update(enemies) {
    super.update();
    /**
     * Check if the bullet has hit any enemies
     */
    enemies
      .filter(e => pointInRect(this, e))
      .forEach(hitEnemy => {
        this.hit = true;
        hitEnemy.minusHealth();
        if (hitEnemy.health <= 0) this.context.canvas.dispatchEvent(new CustomEvent('eh', { detail: hitEnemy }));
      });
  }
}

const AudioContext = window.AudioContext || window.webkitAudioContext;
let fireSound = () => {};
let crashSound = () => {};
let engineSoundOn = () => {};
let engineSoundOff = () => {};
if (AudioContext) {
  const ctx = new AudioContext();
  fireSound = () => {
    const o = ctx.createOscillator();
    o.type = 'square';
    const g = ctx.createGain();
    g.gain.value = 0.5;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    o.frequency.value = 100;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => o.stop(), 100);
  };
  crashSound = () => {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const g = ctx.createGain();
    g.gain.value = 0.5;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    o.frequency.value = 50;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => o.stop(), 150);
  };
  let engineSounds;
  let gain;
  let timer;
  engineSoundOn = level => {
    clearTimeout(timer);
    if (!engineSounds) {
      const filter = ctx.createBiquadFilter();
      filter.type = 0;
      filter.Q.value = 20;
      engineSounds = [ctx.createOscillator(), ctx.createOscillator()];
      const [a, b] = engineSounds;
      a.frequency.value = 10 * level;
      b.frequency.value = 25;

      engineSounds.forEach((x, i) => {
        x.type = 'triangle';
        x.connect(filter);
        x.start(0);
      });
      const gainMaster = ctx.createGain();
      gain = gainMaster.gain;
      gain.value = 0.1;
      filter.connect(gainMaster);
      gainMaster.connect(ctx.destination);
    } else {
      gain.cancelScheduledValues(ctx.currentTime);
      gain.setValueAtTime(0.1, ctx.currentTime);
    }
  };
  engineSoundOff = () => {
    if (gain) {
      gain.setValueAtTime(gain.value, ctx.currentTime);
      gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.02);
    }
    timer = setTimeout(() => {
      if (engineSounds) engineSounds.forEach(x => x.stop());
      engineSounds = null;
    }, 20);
  };

  window.addEventListener('keydown', () => {
    ctx.resume();
    // crashSound();
  });
}

// x,y point path of ship
const shipPath = [30, 0, 22.5, 15, 20, 30, 0, 45, 0, 57, 15, 60, 45, 60, 60, 57, 60, 45, 40, 30, 37.5, 15];
const triangle = (ctx, x1, y1, x2, y2, x3, y3 = y2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.fill();
};
const getPattern = () => {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');

  // Give the pattern a width and height of 50
  patternCanvas.width = 60;
  patternCanvas.height = 60;

  patternContext.fillStyle = '#888';
  patternContext.fillRect(0, 0, 60, 60);
  patternContext.fillStyle = '#444';
  triangle(patternContext, 40, 30, 50, 60, 80);
  triangle(patternContext, 20, 30, 10, 60, -20);
  patternContext.fillStyle = '#777';
  triangle(patternContext, 30, 5, 20, 50, 40);
  patternContext.fillStyle = '#666';
  triangle(patternContext, 30, 5, 20, 40, 40);
  patternContext.fillStyle = '#222';
  triangle(patternContext, 30, 15, 25, 35, 35);
  return patternCanvas;
};
class Ship extends factory$2.class {
  maxShipSpeed = 4;
  hasWarp = false;
  showExhaust = false; // Engine is firing
  bullets = []; // Active bullets
  fireRate = 20; // Bullet fire interval, every x ticks
  lastFire = -20; // Initial value is negative of fire rate
  level = 1; // Ship's level
  engineLevel = 1; // Ship's level
  day = 0; // Days based on ticks
  scrap = 0; // Scrap collected
  rotating = false;
  constructor(cockpit) {
    super({
      width: 60,
      height: 60,
      speedX: 0,
      speedY: 0,
      health: 100,
      anchor: { x: 0.5, y: 0.5 }
    });
    const _this = this;
    const ctx = _this.context;
    _this.cockpit = cockpit;
    // Engine fire gradient
    _this.fireGrad = ctx.createLinearGradient(0, 0, 0, 80);
    _this.fireGrad.addColorStop(0.6, '#f00');
    _this.fireGrad.addColorStop(1, '#600');
    // Ship texture
    _this.color = this.context.createPattern(getPattern(), 'repeat');

    _this.upgrades = [
      [20, () => (_this.fireRate = 15), text.fireRateUpdated],
      [40, () => ((_this.maxShipSpeed = 5.5), _this.engineLevel++), text.maxSpeed],
      [60, () => (_this.fireRate = 10), text.fireRateUpdated],
      [80, () => ((_this.maxShipSpeed = 6.5), _this.engineLevel++), text.maxSpeed],
      [100, () => (_this.health = Math.min(100, _this.health + 50)), text.repair],
      [120, () => (_this.fireRate = 5), text.fireRateUpdated],
      [140, () => ((_this.maxShipSpeed = 7.5), _this.engineLevel++), text.maxSpeed],
      [200, () => (_this.hasWarp = true), text.warpDrive]
    ];
    // Listen for enemies hit, by ship or bullets
    ctx.canvas.addEventListener('eh', () => {
      _this.scrap++;
      _this.upgrades.forEach(([scrap, func, text]) => {
        if (scrap === _this.scrap) {
          _this.level++;
          func();
          cockpit.addStatus(text);
        }
      });
    });
  }
  draw() {
    const _this = this;
    // Generate Ship
    const ctx = _this.context;
    ctx.fillStyle = _this.color;
    ctx.beginPath();
    for (let i = 0; i < shipPath.length; i += 2) ctx.lineTo(shipPath[i], shipPath[i + 1]);
    ctx.fill();
    if (_this.showExhaust) {
      // Generate Exhaust
      ctx.fillStyle = _this.fireGrad;
      ctx.beginPath();
      const r = Math.random();
      const multiplier = Math.floor(Math.pow(_this.maxShipSpeed / 2, 2) * 2);
      // 0-12 incl 12
      range(13).forEach(i =>
        ctx.lineTo(15 + (_this.width / 2 / 12) * i, 60 + (i % 2) * (multiplier * 2 - r * multiplier * Math.sqrt(Math.abs(i / 2 - 3))))
      );
      ctx.fill();
    }
  }
  render() {
    super.render();
    this.bullets.forEach(b => b.render());
  }
  update(enemies, tick) {
    const _this = this;
    // Update Bullets
    _this.bullets.forEach((b, i) => {
      // Check if bullets have gone too far or hit an enemy, remove if so
      if (b.tick < tick - 80 || b.hit) _this.bullets.splice(i, 1);
      else b.update(enemies);
    });
    // Check if it is a new day, day is 10 seconds
    _this.day = Math.floor(tick / 600);
    // Check if ship crashed into an enemy
    enemies
      .filter(e => distanceToTarget({ x: _this.x, y: _this.y }, e) < 55)
      .forEach(hitEnemy => {
        crashSound();
        _this.health -= 10;
        _this.context.canvas.dispatchEvent(new CustomEvent('eh', { detail: hitEnemy }));
      });
    // Show exhaust when forward is clicked, see index for movement
    const prevShowExhaust = _this.showExhaust;
    _this.showExhaust = keyPressed('w');
    if (_this.showExhaust && !prevShowExhaust) engineSoundOn(_this.engineLevel);
    else if (!_this.showExhaust && prevShowExhaust) engineSoundOff();
    if (keyPressed('space') && tick - _this.lastFire >= _this.fireRate) {
      fireSound();
      _this.lastFire = tick;
      _this.fire(tick);
    }
    // Update the ship's speed on key press
    if (keyPressed('w')) {
      _this.speedX += -Math.sin(_this.rotation) * 0.05;
      _this.speedY += Math.cos(_this.rotation) * 0.05;
      const speed = distance(_this.speedX, _this.speedY);
      // Ensure ship does not go over current max speed
      if (speed > _this.maxShipSpeed) {
        _this.speedX *= _this.maxShipSpeed / speed;
        _this.speedY *= _this.maxShipSpeed / speed;
      }
    }

    // Rotate on key press
    // Do a half turn on first key press
    const angle = 0.05 / (this.rotating ? 1 : 2);
    if (keyPressed('a')) {
      _this.rotation = _this.rotation - angle;
      this.rotating = true;
    } else if (keyPressed('d')) {
      _this.rotation = _this.rotation + angle;
      this.rotating = true;
    } else this.rotating = false;
  }
  fire(tick) {
    const _this = this;
    _this.bullets.push(
      new Bullet({
        dx: Math.sin(_this.rotation) * 10,
        dy: -Math.cos(_this.rotation) * 10,
        x: _this.x + Math.sin(_this.rotation) * 40,
        y: _this.y - Math.cos(_this.rotation) * 40,
        rotation: _this.rotation,
        tick
      })
    );
  }
}

const accSpeed = 0.1;
const getPattern$1 = (color, seed) => {
  const patternCanvas = document.createElement('canvas');
  const patternContext = patternCanvas.getContext('2d');

  // Give the pattern a width and height of 50
  patternCanvas.width = 40;
  patternCanvas.height = 40;

  // Give the pattern a background color
  patternContext.fillStyle = color;
  patternContext.fillRect(0, 0, 40, 40);

  const rand = seedRand(seed + 1);
  for (let x = 0, y = 0; y < 40; ) {
    const w = Math.floor(rand() * 7 + 2);
    patternContext.fillStyle = rand() < 0.5 ? '#333' : '#222';
    patternContext.fillRect(x, y, w, Math.floor(rand() * 7 + 2));
    x += 1 + w;
    if (x > 40) {
      y += 5;
      x = 0;
    }
  }
  return patternCanvas;
};
const typeCount = 15;
const colors = range(typeCount).reduce((t, x) => [...t, ...['#080', '#008', '#800'].map(color => getPattern$1(color, x))], []);
class Enemy extends factory$3.class {
  constructor(properties) {
    properties = { ...properties, width: 40, height: 40, speedX: 0, speedY: 0, anchor: { x: 0.5, y: 0.5 } };
    super(properties);
    this.type = Math.floor(Math.random() * typeCount) * 3;
    this.colorList = colors.map(x => this.context.createPattern(x, null));
    this.health++;
    this.minusHealth();
  }
  minusHealth() {
    this.health--;
    if (this.health > 0) this.color = this.colorList[this.health - 1 + this.type];
  }
  update(enemies) {
    const _this = this;
    /**
     * Find the closest other enemy
     */
    const avoidEnemies = enemies.reduce(
      (a, e) => {
        if (e !== _this) {
          const dist = distanceToTarget(_this, e);
          if (dist < a.dist) {
            const angle = angleToTarget(_this, e) + 180;
            return {
              angle,
              dist
            };
          }
        }
        return a;
      },
      { dist: 100, angle: 0 }
    );
    /**
     * Find the path to the players ship
     */
    let angle = angleToTarget(_this, _this.ship);
    if (avoidEnemies.dist !== 100) angle = avoidEnemies.angle + angle / 2;
    _this.speedX -= Math.sin(angle) * accSpeed;
    _this.speedY += Math.cos(angle) * accSpeed;
    const speed = distance(_this.speedX, _this.speedY);
    /**
     * Max Speed starts at 5, works up to 10 over 40 days
     */
    const day = _this.ship.day;
    const maxSpeed = Math.min(day / 8, 5) + 5;
    if (speed > maxSpeed) {
      _this.speedX *= maxSpeed / speed;
      _this.speedY *= maxSpeed / speed;
    }

    _this.dx -= _this.speedX;
    _this.dy -= _this.speedY;
    super.update();
  }
}

const pad$1 = 20;
const fontSize$1 = 36;
const font$1 = `${fontSize$1}px Arial`;
const smallFont = `24px Arial`;
const color$1 = '#fff';
const textAlign$1 = 'center';
const addS = n => (n !== 1 ? 's' : '');
class GameOver extends factory$2.class {
  gameWin = false;
  constructor(ship, gameWin) {
    super();
    engineSoundOff();
    const _this = this;
    _this.background = new factory$3({ width: 600, height: 400, color: '#600A' });
    _this.winText = new factory$4({ font: smallFont, color: color$1, text: "Me: These are the coordinates, where's Earth?", textAlign: textAlign$1 });
    _this.winText2 = new factory$4({ font: smallFont, color: color$1, text: 'Computer: Error: 404. Earth not found.', textAlign: textAlign$1 });
    _this.gameOverText = new factory$4({ font: font$1, color: color$1, text: 'Game Over', textAlign: textAlign$1 });
    _this.highScoreText = new factory$4({ font: font$1, color: color$1, text: `Score: ${ship.scrap}`, textAlign: textAlign$1 });
    const localStorage = window.localStorage;
    if (localStorage) {
      const maxScore = Math.max(localStorage.getItem('lins_score') || 0, ship.scrap);
      const maxDay = localStorage.getItem('lins_day') || 0;
      const maxDayO = ship.scrap >= 200 ? Math.min(maxDay, ship.day) : maxDay;
      localStorage.setItem('lins_score', maxScore);
      localStorage.setItem('lins_day', maxDay);
      _this.maxScoreText = new factory$4({
        font: `18px Arial`,
        color: color$1,
        text: `High Score: ${maxDayO} day${addS(maxDayO)}, ${maxScore} scrap`,
        textAlign: textAlign$1
      });
    }
    _this.dayText = new factory$4({
      font: font$1,
      color: color$1,
      text: `${gameWin ? 'Completed in' : 'Lasted'}: ${ship.day} day${addS(ship.day)}`,
      textAlign: textAlign$1
    });
    _this.playAgainText = new factory$4({ font: font$1, color: color$1, text: 'Play Again? Press Enter', textAlign: textAlign$1 });
    _this.gameWin = gameWin;
  }

  render() {
    const _this = this;
    _this.background.render();
    if (_this.gameWin) {
      _this.winText.render();
      _this.winText2.render();
    } else _this.gameOverText.render();

    _this.highScoreText.render();
    _this.dayText.render();
    if (_this.maxScoreText) _this.maxScoreText.render();
    _this.playAgainText.render();
  }
  update() {
    const _this = this;
    const cw = _this.context.canvas.width / 2;
    const ch = _this.context.canvas.height / 2;
    _this.background.x = cw - _this.background.width / 2;
    _this.background.y = ch - _this.background.height / 2;
    _this.winText.x = cw;
    _this.winText.y = ch - (24 + pad$1) * 3;
    _this.winText2.x = cw;
    _this.winText2.y = ch - (32 + pad$1) * 2;
    _this.gameOverText.x = cw;
    _this.gameOverText.y = ch - (fontSize$1 + pad$1) * 2;
    _this.highScoreText.x = cw;
    _this.highScoreText.y = ch - (fontSize$1 + pad$1);
    _this.dayText.x = cw;
    _this.dayText.y = ch;
    if (_this.maxScoreText) {
      _this.maxScoreText.x = cw;
      _this.maxScoreText.y = ch + (fontSize$1 + pad$1);
    }
    _this.playAgainText.x = cw;
    _this.playAgainText.y = ch + (fontSize$1 + pad$1) * 2;
  }
}

const { canvas } = init();
/**
 * Track the browser window and resize the canvas
 */
function resize() {
  const c = document.getElementsByTagName('canvas')[0];
  c.width = window.innerWidth;
  c.height = window.innerHeight;
}
window.addEventListener('resize', resize, false);
resize();
initKeys();
let titleText = new factory$4({
  color: '#600D',
  font: `70px Arial`,
  textAlign: 'center',
  text: 'Lost In Space',
  x: canvas.width / 2,
  y: canvas.height / 4
});
/**
 * Set variables used in the loops
 */
let gameStart;
let gameOver;
let cockpit;
let starField;
let ship;
let enemies;
let tick;
/**
 * Initial values for the game start and setup
 */
const initGame = () => {
  gameStart = true;
  gameOver = null;
  cockpit = new Cockpit();
  starField = new StarField();
  ship = new Ship(cockpit);
  tick = 1;
  enemies = [];
  [
    'Me: Where am I?',
    'Computer: Error: 404. Location Not Found.',
    'Me: It looks like I have drifted for 10 warp days. I will have to find my way back.',
    "Me: This may be Corg space, I don't want to get assimil...assinated.",
    'Me: Computer, System Status.',
    'Computer: All systems have been destroyed.',
    'Me: Ugh, now I need some scrap to fix the systems.',
    'Computer: 200t of scrap are needed',
    'Computer: Use my WASD keys to fly and The Bar to shoot.'
  ].forEach(t => cockpit.addStatus(t, (Math.max(t.split(' ').length, 6) / 150) * 60000));
};
initGame();

/**
 * Update the main game loop
 */
const mainGameLoop = () => {
  // Check if an enemy should spawn
  if (tick % Math.max((30 - ship.day) * 3, 30) === 0) {
    /**
     * Generate a spawn location outside of the canvas
     * Initially only the y is guaranteed outside the canvas, [0-1.5, 1-1.5]
     * X,Y are randomly flipped
     */
    const spawn = [Math.random() * 1.5, Math.random() - 0.5];
    spawn[1] = Math.sign(spawn[1]) + spawn[1];
    if (Math.random() > 0.5) spawn.reverse();
    /**
     * Determine the possibility for the health
     * After day 3, chance goes up above health 1.
     * Day 23 has the max chance of seeing health 3
     */

    const healthChance = Math.max(Math.min((ship.day - 3) / 20, 1) * 2, 0) + 1;
    enemies.push(
      new Enemy({
        x: spawn[0] * canvas.width,
        y: spawn[1] * canvas.height,
        ship,
        health: Math.floor(Math.pow(Math.random(), 2) * healthChance + 1)
      })
    );
  }
  tick++;
  ship.update(enemies, tick);
  cockpit.update(ship);
  // Move the background based on the ship's speed
  starField.dx = ship.speedX;
  starField.dy = ship.speedY;
  starField.update();
  enemies.forEach(e => {
    e.dx = ship.speedX;
    e.dy = ship.speedY;
    e.update(enemies);
  });
  // Win Condition
  if (ship.scrap === 200) {
    setTimeout(() => {
      enemies = [];
      gameOver = new GameOver(ship, true);
    }, 3000);
  }
};
/**
 * Render the main game loop
 */
const mainGameRender = () => {
  starField.render();
  enemies.forEach(e => e.render());
  ship.render();
  cockpit.render();
};
/**
 * Render the start of the game loop
 */
let keyUp = true;
const gameStartLoop = () => {
  // Check for messages left in the queue and if there is none left start the game
  if (cockpit.queue.length === 0) gameStart = false;
  cockpit.setSkipHelper(gameStart);
  if (keyPressed('space')) {
    // Only move forward if this is the first update space was pressed
    if (keyUp) {
      keyUp = false; // Set that the key is pressed
      cockpit.getNextStatus();
    }
  } else keyUp = true; // Set the key is up
  cockpit.update(ship);
};

const loop = GameLoop({
  clearCanvas: false,
  // create the main game loop
  update: () => {
    if (gameOver) {
      gameOver.update();
      // Restart the game if enter is pressed
      if (keyPressed('enter')) initGame();
    } else if (!gameStart) mainGameLoop();
    // Keep ship centered
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
  },
  render: () => {
    mainGameRender();
    if (gameOver) gameOver.render();
    else if (gameStart) gameStartLoop();
    if (titleText) titleText.render();
  }
});
// Listen for enemy hits
canvas.addEventListener('eh', ({ detail }) => {
  // Update the enemy list
  enemies.splice(enemies.indexOf(detail), 1);
  // Check the health of the ship
  if (ship.health <= 0) gameOver = new GameOver(ship, false);
});
// Start the game loop
loop.start();
setTimeout(() => (titleText = null), 6000);
