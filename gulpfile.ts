import * as gulp from 'gulp';
import * as sass from 'gulp-sass';
import * as pug from 'gulp-pug';
import { Configuration } from 'webpack';
import * as webpack from 'webpack-stream';
const named = require('vinyl-named');

const node = '!node_modules/**/*';
const paths = {
    pages: ['**/*.pug', node, '!templates/**/*'],
    styles: ['**/*.scss', node],
    bundle: ['**/*.ts', '**/*.js', node, '!*.ts', '!**/*.bundle.js'],
    out: '.'

};
const config: Configuration = {
    module: {
        rules: [
            { test: /\.ts$/, use: 'ts-loader' }
        ]
    },
    output: {
        filename: '[name]/[name].bundle.js'
    }
};

export function pages() {
    return gulp.src(paths.pages)
        .pipe(pug())
        .pipe(gulp.dest(paths.out));
}

export function styles() {
    return gulp.src(paths.styles)
        .pipe(sass())
        .pipe(gulp.dest(paths.out))
}

export function bundle() {
    return gulp.src(paths.bundle)
        .pipe(named())
        .pipe(webpack(config))
        .pipe(gulp.dest(paths.out))
}

gulp.task('default', gulp.series(pages, styles, bundle));
