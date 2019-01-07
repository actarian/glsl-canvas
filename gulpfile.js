/* jshint esversion: 6 */

const fs = require('fs'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    merge = require("merge-stream"),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    concatutil = require('gulp-concat-util'),
    cssmin = require('gulp-cssmin'),
    html2js = require('gulp-html2js'),
    path = require('path'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    scss = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    webserver = require('gulp-webserver'),
    browserify = require('browserify'),
    tsify = require('tsify'),
    through2 = require('through2');

const bundler = './bundler.config.json';
const compiler = './compiler.config.json';

// COMPILE
gulp.task('compile:scss', () => {
    const tasks = getCompilers('.scss')
        .map((compile) => {
            return gulp.src(compile.inputFile, {
                    base: '.'
                })
                .pipe(plumber())
                .pipe(scss({
                        includePaths: ['./node_modules/', __dirname + '/node_modules', 'node_modules'],
                    })
                    .on('compile:scss.error', (error) => {
                        logger.error('compile:scss', error);
                    }))
                .pipe(autoprefixer())
                .pipe(rename(compile.outputFile))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('./'))
                .on('end', () => logger.log('compile', compile.outputFile));
        });
    return merge(tasks);
});
gulp.task('compile:js', () => {
    const tasks = getCompilers('.js')
        .map((compile) => {
            return gulp.src(compile.inputFile, {
                    base: '.'
                })
                .pipe(plumber())
                .pipe(sourcemaps.init())
                .pipe(through2.obj((file, enc, next) => {
                        browserify(file.path)
                            .plugin(tsify)
                            .transform('babelify', {
                                global: true,
                                presets: [
                                    ["@babel/preset-env", {
                                        targets: {
                                            chrome: '58',
                                            ie: '11'
                                        },
                                    }]
                                ],
                                extensions: ['.js']
                            })
                            .bundle((error, response) => {
                                if (error) {
                                    logger.error('compile:js', error);
                                } else {
                                    logger.log('browserify.bundle.success', compile.outputFile);
                                    file.contents = response;
                                    next(null, file);
                                }
                            })
                            .on('error', (error) => {
                                logger.error('compile:js', error.toString());
                            });
                    }
                    /*, (done) => {
                    	logger.log('through2.done', error);
                    }*/
                ))
                .pipe(rename(compile.outputFile))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('./'))
                .on('end', () => logger.log('compile', compile.outputFile));
        });
    return merge(tasks);
});
gulp.task('compile:ts', () => {
    const tasks = getCompilers('.ts')
        .map((compile) => {
            logger.log(compile.inputFile);
            return gulp.src(compile.inputFile, {
                    base: '.'
                })
                .pipe(plumber())
                .pipe(sourcemaps.init())
                .pipe(through2.obj((file, enc, next) => {
                        browserify(file.path)
                            .plugin(tsify)
                            .transform('babelify', {
                                global: true,
                                plugins: ['@babel/plugin-transform-flow-strip-types'],
                                presets: [
                                    ["@babel/preset-env", {
                                        targets: {
                                            chrome: '58',
                                            ie: '11'
                                        },
                                    }],
                                ],
                                extensions: ['.ts']
                            })
                            .bundle((error, response) => {
                                if (error) {
                                    logger.error('compile:ts', error);
                                } else {
                                    file.contents = response;
                                    next(null, file);
                                }
                            })
                            .on('error', (error) => {
                                logger.error('compile:ts', error.toString());
                            });
                    }
                    /*, (done) => {
                    	logger.log('through2.done', error);
                    }*/
                ))
                .pipe(rename(compile.outputFile))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('./'))
                .on('end', () => logger.log('compile', compile.outputFile));
        });
    return merge(tasks);
});
gulp.task('compile:partials', () => {
    return gulp.src('./src/artisan/**/*.html', {
            base: './src/artisan/'
        })
        .pipe(plumber())
        .pipe(rename((path) => {
            path.dirname = path.dirname.split('\\')
                .join('/');
            path.dirname = path.dirname.split('artisan/')
                .join('');
            // path.basename += "-partial";
            path.extname = '';
            // logger.log('path', path);
        }))
        .pipe(html2js('artisan-partials.js', {
            adapter: 'angular',
            // base: '.',
            name: 'artisan',
            fileHeaderString: '/* global angular: false */',
            quoteChar: '\'',
            indentString: '\t\t',
            singleModule: true,
            useStrict: true,
        }))
        .pipe(gulp.dest('./docs/js/'))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./docs/js/'));
});
gulp.task('compile:snippets', () => {
    return gulp.src('./src/snippets/**/*.glsl', {
            base: './src/snippets/'
        })
        .pipe(plumber())
        .pipe(rename((path) => {
            path.dirname = path.dirname.split('\\')
                .join('/');
            path.dirname = path.dirname.split('src/snippets/')
                .join('');
            path.extname = '';
        }))
        .pipe(concatutil('glsl.json', {
            process: (source, filePath) => {
                const folders = filePath.replace('src/snippets/', '')
                    .split(path.sep);
                const name = folders.join('.');
                const body = source.trim();
                const r = /^\/\*(?:\s?)(.*)\*\//g.exec(body);
                let description = name;
                if (r && r.length === 2) {
                    description = r[1];
                }
                const item = {
                    prefix: 'glsl.' + name,
                    body: body,
                    description: description,
                };
                item.body = body;
                return '\t"' + name + '":' + JSON.stringify(item, null, 2) + ",\n";
            }
        }))
        .pipe(concatutil('glsl.json', {
            process: (source, filePath) => {
                source = source.replace(new RegExp(',\n' + '$'), '\n');
                return "{\n" + source + "\n}";
            }
        }))
        .pipe(gulp.dest('./snippets/'));
});
gulp.task('compile', ['compile:scss', 'compile:js', 'compile:ts']);
// gulp.task('compile', ['compile:scss', 'compile:js', 'compile:ts', 'compile:partials', 'compile:snippets']);

// BUNDLE
gulp.task('bundle:css', () => {
    const tasks = getBundles('.css')
        .map((bundle) => {
            return doCssBundle(gulp.src(bundle.inputFiles, {
                base: '.'
            }), bundle);
        });
    return merge(tasks);
});
gulp.task('bundle:js', () => {
    const tasks = getBundles('.js')
        .map((bundle) => {
            return doJsBundle(gulp.src(bundle.inputFiles, {
                base: '.'
            }), bundle);
        });
    return merge(tasks);
});
gulp.task('bundle', ['bundle:css', 'bundle:js']);

// WATCH
gulp.task('watch', (done) => {
    const scssSources = getCompilers('.scss')
        .map(x => {
            return x.inputFile.replace(/\/[^\/]*$/, '/**/*.scss');
        });
    if (scssSources.length > 0) {
        gulp.watch(scssSources, ['compile:scss'])
            .on('change', logWatch);
    }
    const jsSources = getCompilers('.js')
        .map(x => {
            return x.inputFile.replace(/\/[^\/]*$/, '/**/*.js');
        });
    if (jsSources.length > 0) {
        gulp.watch(jsSources, ['compile:js'])
            .on('change', logWatch);
    }
    const tsSources = getCompilers('.ts')
        .map(x => {
            return x.inputFile.replace(/\/[^\/]*$/, '/**/*.ts');
        });
    if (tsSources.length > 0) {
        gulp.watch(tsSources, ['compile:ts'])
            .on('change', logWatch);
    }
    // gulp.watch('./src/artisan/**/*.html', ['compile:partials']).on('change', logWatch);
    // gulp.watch('./src/snippets/**/*.glsl', ['compile:snippets']).on('change', logWatch);
    getBundles('.css')
        .forEach((bundle) => {
            gulp.watch(bundle.inputFiles, () => {
                    return doCssBundle(gulp.src(bundle.inputFiles, {
                        base: '.'
                    }), bundle);
                })
                .on('change', logWatch);
        });
    getBundles('.js')
        .forEach((bundle) => {
            gulp.watch(bundle.inputFiles, () => {
                    return doJsBundle(gulp.src(bundle.inputFiles, {
                        base: '.'
                    }), bundle);
                })
                .on('change', logWatch);
        });
    gulp.watch(compiler, ['compile', 'bundle'])
        .on('change', logWatch);
    gulp.watch(bundler, ['bundle'])
        .on('change', logWatch);
    done();
});

// WEBSERVER
gulp.task('webserver', () => {
    return gulp.src('./docs/')
        .pipe(webserver({
            port: 6600,
            fallback: 'index.html',
            open: true,
            livereload: true,
            directoryListing: false,
        }));
});

gulp.task('default', ['compile', 'bundle', 'webserver', 'watch']);

gulp.task('start', ['compile', 'bundle', 'watch']);

// METHODS
function doCssBundle(glob, bundle) {
    return glob
        .pipe(plumber())
        .pipe(concat(bundle.outputFileName))
        .pipe(gulp.dest('.'))
        .on('end', () => logger.log('bundle', bundle.outputFileName))
        // .pipe(sourcemaps.init())
        .pipe(gulpif(bundle.minify && bundle.minify.enabled, cssmin()))
        .pipe(rename({
            extname: '.min.css'
        }))
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
}

function doJsBundle(glob, bundle) {
    return glob
        .pipe(plumber())
        .pipe(concat(bundle.outputFileName))
        .pipe(gulp.dest('.'))
        .on('end', () => logger.log('bundle', bundle.outputFileName))
        .pipe(sourcemaps.init())
        .pipe(gulpif(bundle.minify && bundle.minify.enabled, uglify()))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
}

function getCompilers(ext) {
    const data = getJson(compiler);
    if (data) {
        return data.filter((compile) => {
            return new RegExp(`${ext}$`)
                .test(compile.inputFile);
        });
    } else {
        return [];
    }
}

function getBundles(ext) {
    const data = getJson(bundler);
    if (data) {
        return data.filter((bundle) => {
            return new RegExp(`${ext}$`)
                .test(bundle.outputFileName);
        });
    } else {
        return [];
    }
}

function getJson(path) {
    if (fs.existsSync(path)) {
        const text = fs.readFileSync(path, 'utf8');
        // logger.log('getJson', path, text);
        return JSON.parse(stripBom(text));
    } else {
        return null;
    }
}

function stripBom(text) {
    text = text.toString();
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }
    return text;
}

const palette = {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    Dim: '\x1b[2m',
    Underscore: '\x1b[4m',
    Blink: '\x1b[5m',
    Reverse: '\x1b[7m',
    Hidden: '\x1b[8m',
    //
    FgBlack: '\x1b[30m',
    FgRed: '\x1b[31m',
    FgGreen: '\x1b[32m',
    FgYellow: '\x1b[33m',
    FgBlue: '\x1b[34m',
    FgMagenta: '\x1b[35m',
    FgCyan: '\x1b[36m',
    FgWhite: '\x1b[37m',
    //
    BgBlack: '\x1b[40m',
    BgRed: '\x1b[41m',
    BgGreen: '\x1b[42m',
    BgYellow: '\x1b[43m',
    BgBlue: '\x1b[44m',
    BgMagenta: '\x1b[45m',
    BgCyan: '\x1b[46m',
    BgWhite: '\x1b[47m',
};

const colors = [palette.FgWhite, palette.FgCyan, palette.FgGreen, palette.FgYellow, palette.FgMagenta, palette.FgBlue];

function padStart(text, count = 2, char = '0') {
    text = text.toString();
    while (text.length < count) {
        text = char + text;
    }
    return text;
}

class logger {
    static log() {
        const date = new Date();
        const hh = padStart(date.getHours());
        const mm = padStart(date.getMinutes());
        const ss = padStart(date.getSeconds());
        let a = Array.from(arguments);
        a = [].concat.apply([], (a.map((x, i) => [colors[i % colors.length], x])));
        a.unshift(`${palette.FgWhite}[${palette.Dim}${hh}:${mm}:${ss}${palette.Reset}${palette.FgWhite}]`);
        a.push(palette.Reset);
        console.log.apply(this, a);
    }
    static error() {
        const date = new Date();
        const hh = padStart(date.getHours());
        const mm = padStart(date.getMinutes());
        const ss = padStart(date.getSeconds());
        let a = Array.from(arguments);
        a = [].concat.apply([], (a.map((x, i) => [palette.Red, x])));
        a.unshift(`${palette.FgWhite}[${palette.Dim}${hh}:${mm}:${ss}${palette.Reset}${palette.FgWhite}]`);
        a.push(palette.Reset);
        console.log.apply(this, a);
    }
}

function logWatch(e) {
    logger.log(e.type, e.path);
}