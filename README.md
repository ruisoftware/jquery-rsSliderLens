# jquery-rsSliderLens [![Build Status](https://travis-ci.org/ruisoftware/jquery-rsSliderLens.svg?branch=master)](https://travis-ci.org/ruisoftware/jquery-rsSliderLens)
Renders a powerfull input range control.<br>

With minor differences, all browsers render an <code>&lt;input type="range" /&gt;</code> pretty much the same way:  
![default](https://cloud.githubusercontent.com/assets/428736/20031930/0c3e0f5c-a391-11e6-923f-c080e0fbe0e9.png)

Using this plugin, the same markup is rendered by default as:  
![sample1](https://cloud.githubusercontent.com/assets/428736/20031939/2a682e2c-a391-11e6-961d-47d5f3a95969.png)

or pretty much any style your imagination takes you:  
![sample2](https://cloud.githubusercontent.com/assets/428736/20301845/1cf9c8c0-ab36-11e6-9cf4-7f80a53b94c1.png)

Check out a [demo](https://codepen.io/ruisoftware/pen/mOEeOp).
Also available at `src/demo/demo.html`

# Key Features
 - Works for any markup. Although semantically the <code>&lt;input type="range" /&gt;</code> is the most appropriate markup, any other element can be used.
 - Keyboard and mouse navigation. For a markup other than <code>&lt;input type="range" /&gt;</code> to be focusable, it has to have a <code>[tabindex](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)</code> attribute;
 - Two types of slider:
    - Sliding type: The handle can move along the slide rail;
    - Fixed type: The handle remains in a fixed position, while the slide rail moves underneath;
 - When using the sliding type, two handles can be utilized to select ranges;
 - If desired, it can display magnified content inside the handle(s);
 - Supports both horizontal and vertical orientations;
 - Supports left to right and top to bottom directions. These directions can be reversed;
 - Either renders a rule or the markup's original content;
 - Highly customizable:
    - LESS file used to generate CSS in the color layout you wish;
    - Responsive design, through the use of relative CSS units;
    - Strong event driven support;
    - Slider content can be overridden or rewritten from scratch;
 - Fast loading. No images used whatsoever;
 - Supports desktop and mobile events.
 
# Installation

You can install from [npm](https://www.npmjs.com/):
````bash
npm install jquery.rsSliderLens --save
````
or directly from git:
````javascript
<script src="http://rawgit.com/ruisoftware/jquery-rsSliderLens/master/src/jquery.rsSliderLens.js"></script>
````
or you can download the Zip archive from github, clone or fork this repository and include `jquery.rsSliderLens.js` from your local machine.

You also need to download jQuery. In the example below, jQuery is downloaded from Google cdn.

# Usage

First, you must run `grunt`. Grunt among other tasks, compiles LESS file into CSS, minimizes the js file and places all production files inside a new `dist` folder.<br>

Create the following file in the `src` folder (or you can try it [live here](https://codepen.io/ruisoftware/pen/XNdNZL)).

````html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="../dist/rsSliderLens.css" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="../dist/jquery.rsSliderLens.min.js"></script>
    <style>
        section {
            margin: 1em 3em;
        }
        p {
            margin-top: 3em;
            color: #eee;
        }
    </style>
</head>
<body>
    <section>
        <p>Ruler slider</p>
        <input type="range">

        <p>Fixed ruler slider ranging from -100 to 100 with a step of 5</p>
        <input type="range" min="-100" max="100" step="5">

        <p>Content slider</p>
        <span>This is the original HTML content</span>
    </section>

    <script>
        $("input[type=range]").eq(0).rsSliderLens();

        $("input[type=range]").eq(1).rsSliderLens({
            paddingStart: .1,
            paddingEnd: .1,
            fixedHandle: true,
            ruler: {
                size: 6 // 600% of the slider width
            }
        });

        $("span").rsSliderLens({
            ruler: {
                visible: false // hide the ruler, show the html content
            }
        });
    </script>
</body>
</html>

````
# License
This project is licensed under the terms of the [MIT license](https://opensource.org/licenses/mit-license.php)

# Bug Reports & Feature Requests
Please use the [issue tracker](https://github.com/ruisoftware/jquery-rsSliderLens/issues) to report any bugs or file feature requests.

# Contributing
Please refer to the [Contribution page](https://github.com/ruisoftware/jquery-rsSliderLens/blob/master/CONTRIBUTING.md) from more information.
