// Zencart E-Commerce: Style Template
//
// Gulpfile to create Bootstrap based CSS and JS files for Zencart.
//

/*******************************
  ****************************
  * 01: SET CONSTANTS
  ****************************
********************************/
const $              = require( 'gulp-load-plugins' )();
const GULP           = require( 'gulp' );
const ARGV           = require( 'yargs' ).argv;
const REMOVE         = require( 'del' );
const STREAM         = require( 'event-stream' );
const BROWSER        = require( 'browser-sync' );
const CSS_PROCESS    = [
  require( 'postcss-normalize-charset' ),
  require( 'postcss-remove-prefixes' ), 
  require( 'postcss-ordered-values' ),
  require( 'postcss-merge-rules' ), 
  require( 'postcss-fakeid' ),
  require( 'css-declaration-sorter' )
];


// Flag whether to build for production
const PRODUCTION = !!( ARGV.production );

// Port to use for the development server.
const DEV_PORT = 8000;

// Browsers to target when prefixing CSS.
const COMPATIBILITY = ['last 2 versions', 'ie >= 9'];

// Random cache buster
const CACHEFLAG = '?' + Math.floor( Math.random()*900000 ) + 100000;

// JQuery version
const JQ_VER = '3.1.0';

const UI_FIX = "/*! Fix Bootstrap/JQuery-UI conflicts | See http://stackoverflow.com/a/27745464/1233379 */\n'undefined'!=typeof $.ui&&($.widget.bridge('uibutton',$.ui.button),$.widget.bridge('uitooltip',$.ui.tooltip));\n\n";

// Use additional font icons
const FONT_SASS = 'src/fonts/**/scss/';
const FONT_PATH = 'src/fonts/**/fonts/**/*';

// Ensure license information shows up clearly in minified files.			
const CLEAN_UP = [
		['*/', '*/\n'],
		['\n\n', '\n'],
		[',/*', ',\n\n/*'],
		[';/*', ';\n\n/*'],
		[')/*', ')\n\n/*'],
		['}/*', '}\n\n/*'],
		[new RegExp( '( [a-zA-Z0-9_$] )' ) + '/*', '\n/*']
	];	

// Misc filesystem paths
const DIST_DEMO_DEV		= 'zencart/demo'
const DIST_ADMIN_DEV	= 'zencart/dev/zc_admin/includes/template'
const DIST_ADMIN_SRC	= 'zencart/plaintext/zc_admin/includes/template'
const DIST_ADMIN_PROD	= 'zencart/minified/zc_admin/includes/template'
const DIST_CATALOG_DEV	= 'zencart/dev/zc_catalog/includes/templates/template_default'
const DIST_CATALOG_SRC	= 'zencart/plaintext/zc_catalog/includes/templates/template_default'
const DIST_CATALOG_PROD	= 'zencart/minified/zc_catalog/includes/templates/template_default'

// File paths to various assets are defined here.
const PATHS = {
	assets: [
		'src/assets/{zc_admin,zc_catalog}/**/*',
		'!src/assets/{zc_admin,zc_catalog}/{images,javascript,scss}/**/*',
		'!src/assets/{zc_admin,zc_catalog}/{images,javascript,scss}/**/',
		'!src/assets/{zc_admin,zc_catalog}/{images,javascript,scss}/'
	],
	js_plugins: [
		'src/assets/plugins/**/*',
		'!src/assets/plugins/flot/**/*',
		'!src/assets/plugins/flot/**/',
		'!src/assets/plugins/flot/',
		'!src/assets/plugins/input-mask/**/*',
		'!src/assets/plugins/input-mask/**/',
		'!src/assets/plugins/input-mask/',
	],
	flot_plugins: [
		'src/assets/plugins/flot/**/*.js',
		'!src/assets/plugins/flot/jquery.flot.js',
		'!src/assets/plugins/flot/excanvas.js',
	],
	inputmask_extensions: [
		'src/assets/plugins/input-mask/**/*.js',
		'!src/assets/plugins/input-mask/jquery.inputmask.js',
	],
	js_extra: [
		'src/bootswatch/javascript/**/*.js',
		'!src/bootswatch/javascript/bootswatch_demo.js'
	],
	sass_fonts_include: [
		FONT_SASS,
		'src/fonts/foundation-icons/scss/'
	]
};

/*******************************
  ****************************
  * 02: MAIN BUILD TASK
  ****************************
********************************/
// Build the site
GULP.task( 'build', function( done ) {
	$.sequence( 
		['clean:zencart'],
		['pages', 'sass', 'javascript', 'images', 'copy'],
	done );
});

/*******************************
  ****************************
  * 03: LIVERELOAD SERVER
  ****************************
********************************/
// Start a server with LiveReload to preview the site
GULP.task( 'server', ['build'], function() {
	BROWSER.init( {
		server: 'zencart', port: DEV_PORT
	});
});

/*******************************
  ****************************
  * 04: PREP FOLDERS
  ****************************
********************************/
// Remove the "zencart" folder if it exists
GULP.task( 'clean:zencart', function( done ) {
	return REMOVE( 'zencart/**' );
});

/*******************************
  ****************************
  * 05: BUILD HTML FILES
  ****************************
********************************/
// HTML build dispatcher
GULP.task( 'pages', function( done ) {
	var demo_css_path = '/demo/css/';
	var demo_js_path = '/demo/javascript/';
	var demo_folder_path = DIST_DEMO_DEV.replace( 'zencart/','/' );
 
	var jquery_js_file = demo_folder_path + '/javascript/jquery.js' + CACHEFLAG;
	var demo_js_file = demo_folder_path + '/javascript/bootswatch_demo.js' + CACHEFLAG;
	var demo_css_file = demo_folder_path + '/css/bootswatch_demo.css' + CACHEFLAG;
	var demo_img_file = demo_folder_path + '/images/zen-cart.png' + CACHEFLAG;
  
	var main_css_file = demo_css_path + 'app-main.css' + CACHEFLAG;
	var main_js_file = demo_js_path + 'app-main.js' + CACHEFLAG;
	var extra_css_file = demo_css_path + 'app-extra.css' + CACHEFLAG;
	var extra_js_file = demo_js_path + 'app-extra.js' + CACHEFLAG;
	var fonts_css_file = demo_css_path + 'app-fonts.css' + CACHEFLAG;
  
	var replace_html = $.htmlReplace( {
		'jquery_js': jquery_js_file,
		'main_js': main_js_file,
		'main_css': main_css_file,
		'extra_js': extra_js_file,
		'extra_css': extra_css_file,
		'demo_js': demo_js_file,
		'demo_css': demo_css_file,
		'demo_img': demo_img_file,
		'fonts_css': fonts_css_file,
	});
	
	return STREAM.concat( 
		GULP.src( ['src/pages/**/*.html', '!src/pages/index.html'] )
			.pipe( replace_html )
			.pipe( $.prettify() )
			.pipe( GULP.dest( 'zencart/pages' ) ),
		
		GULP.src( ['src/pages/index.html'] )
			.pipe( replace_html )
			.pipe( $.prettify() )
			.pipe( GULP.dest( 'zencart' ) )
	 );
});

/*******************************
  ****************************
  * 06: BUILD CSS FILES
  ****************************
********************************/
// CSS build dispatcher
GULP.task( 'sass', function( done ) {
	$.sequence( 
		['sass:main', 'sass:extra', 'sass:fonts'],
		['sass:demo', 'sass:print', 'sass:legacy'],
	done );
});

// Compile main CSS
GULP.task( 'sass:main', function() {
	return GULP.src( 'src/bootswatch/scss/bootstrap.scss' )
		.pipe( $.sass().on( 'error', $.sass.logError ) )
		.pipe( $.rename( 'app-main.css' ) )
		.pipe( $.postcss( CSS_PROCESS ) )
		.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
		.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/css' ) ) )
		.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_ADMIN_DEV + '/css' ) ) )
		.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_CATALOG_DEV + '/css' ) ) )
		.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_SRC + '/css' ) ) )
		.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_SRC + '/css' ) ) )
		
		// Minify main CSS file for production build
		.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
		.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
		.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
		.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/css' ) ) )
		.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_PROD + '/css' ) ) );
});

// Compile demo CSS
GULP.task( 'sass:demo', function() {
	var retvar;
	if( !PRODUCTION ) {
		retvar = GULP.src( ['src/bootswatch/scss/bootswatch_demo.scss'] )
			.pipe( $.sass().on( 'error', $.sass.logError ) )
			.pipe( $.postcss( CSS_PROCESS ) )
			.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
			.pipe( GULP.dest( DIST_DEMO_DEV + '/css' ) );
	}
	return retvar;
});

// Compile print CSS
GULP.task( 'sass:print', function() {
	return STREAM.concat( 
		GULP.src( ['src/assets/zc_admin/scss/admin_print.scss'] )
			.pipe( $.sass().on( 'error', $.sass.logError ) )
			.pipe( $.rename( 'admin-print.css' ) )
			.pipe( $.postcss( CSS_PROCESS ) )
			.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_ADMIN_SRC + '/css' ),
				GULP.dest( DIST_ADMIN_DEV + '/css' ) 
		 	) )
			.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
			.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
			.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
			.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/css' ) ) ),
		
		GULP.src( ['src/assets/zc_catalog/scss/catalog_print.scss'] )
			.pipe( $.sass().on( 'error', $.sass.logError ) )
			.pipe( $.rename( 'catalog-print.css' ) )
			.pipe( $.postcss( CSS_PROCESS ) )
			.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_CATALOG_SRC + '/css' ),
				GULP.dest( DIST_CATALOG_DEV + '/css' ) 
		 	) )
			.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
			.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
			.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
			.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_PROD + '/css' ) ) )
	 );
});

// Compile legacy CSS
GULP.task( 'sass:legacy', function() {
	return STREAM.concat( 
		GULP.src( ['src/assets/zc_admin/scss/legacy/admin_legacy.scss'] )
			.pipe( $.sass().on( 'error', $.sass.logError ) )
			.pipe( $.rename( 'admin-legacy.css' ) )
			.pipe( $.postcss( CSS_PROCESS ) )
			.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_ADMIN_SRC + '/css' ),
				GULP.dest( DIST_ADMIN_DEV + '/css' ) 
		 	) )
			.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
			.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
			.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
			.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/css' ) ) ),
		
		GULP.src( ['src/assets/zc_catalog/scss/legacy/catalog_legacy.scss'] )
			.pipe( $.sass().on( 'error', $.sass.logError ) )
			.pipe( $.rename( 'catalog-legacy.css' ) )
			.pipe( $.postcss( CSS_PROCESS ) )
			.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_CATALOG_SRC + '/css' ),
				GULP.dest( DIST_CATALOG_DEV + '/css' ) 
		 	) )
			.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
			.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
			.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
			.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_PROD + '/css' ) ) )
	 );
});

// Compile extra CSS
GULP.task( 'sass:extra', function( done ) {
	var admin_extra = GULP.src( ['src/assets/zc_admin/scss/zencart_admin.scss'] )
		.pipe( $.sass().on( 'error', $.sass.logError ) )
		.pipe( $.postcss( CSS_PROCESS ) )
		.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) );
	var catalog_extra = GULP.src( ['src/assets/zc_catalog/scss/zencart_catalog.scss'] )
		.pipe( $.sass().on( 'error', $.sass.logError ) )
		.pipe( $.postcss( CSS_PROCESS ) )
		.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) );
	var app_extra = GULP.src( ['src/bootswatch/scss/bootswatch.scss'] )
		.pipe( $.sass().on( 'error', $.sass.logError ) )
		.pipe( $.postcss( CSS_PROCESS ) )
		.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
		.pipe( $.rename( 'app-extra.css' ) )
		.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/css' ) ) );
	
	return STREAM.concat( 
		$.merge( app_extra, admin_extra )
			.pipe( $.concat( 'admin-extra.css' ) )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_ADMIN_SRC + '/css' ),
				GULP.dest( DIST_ADMIN_DEV + '/css' ) 
			 ) ),
		$.merge( app_extra, admin_extra )
			.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
			.pipe( $.cond( PRODUCTION, $.concat( 'admin-extra.min.css' ) ) )
			.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
			.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/css' ) ) ),
	
		$.merge( app_extra, catalog_extra )
			.pipe( $.concat( 'catalog-extra.css' ) )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_CATALOG_SRC + '/css' ),
				GULP.dest( DIST_CATALOG_DEV + '/css' ) 
			 ) ),
		$.merge( app_extra, catalog_extra )
			.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
			.pipe( $.cond( PRODUCTION, $.concat( 'catalog-extra.min.css' ) ) )
			.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
			.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_PROD + '/css' ) ) )
	 );
});

// Compile font CSS
GULP.task( 'sass:fonts', function( done ) {
	return GULP.src( [FONT_SASS + '**/*.scss'] )
		// Needed to build foundation-icons without the whole foundation
		.pipe( $.injectString.prepend( "@import 'unit';\n\n" ) )
		
		// Process and rename
		.pipe( $.sass( {includePaths: PATHS.sass_fonts_include} )
			.on( 'error', $.sass.logError ) )
		.pipe( $.concat( 'app-fonts.css' ) )
		.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
		.pipe( $.postcss( CSS_PROCESS ) )
		.pipe( $.cond( PRODUCTION, 
        	GULP.dest( DIST_ADMIN_SRC + '/css' ),
        	GULP.dest( DIST_ADMIN_DEV + '/css' )
        ) )
		.pipe( $.cond( PRODUCTION, 
        	GULP.dest( DIST_CATALOG_SRC + '/css' ),
        	GULP.dest( DIST_CATALOG_DEV + '/css' )
        ) )
		.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/css' ) ) )
        
         // Minify app-fonts CSS file for production build
		.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
		.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
		.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
		.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/css' ) ) )
		.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_PROD + '/css' ) ) );
});

/*******************************
  ****************************
  * 07: BUILD JAVASCRIPT FILES
  ****************************
********************************/
// JS build dispatcher
GULP.task( 'javascript', function( done ) {
	var admin_dir = PRODUCTION ? DIST_ADMIN_SRC + '/javascript' : DIST_ADMIN_DEV + '/javascript';
	var catalog_dir = PRODUCTION ? DIST_CATALOG_SRC + '/jscript' : DIST_CATALOG_DEV + '/jscript';
  
	var admin_extra = GULP.src( ['src/assets/zc_admin/javascript/**/*.js'] );
	var catalog_extra = GULP.src( ['src/assets/zc_catalog/javascript/**/*.js'] );
	var app_extra = GULP.src( PATHS.js_extra )
			.pipe( $.concat( 'app-extra.js' ) )
			.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/javascript' ) ) );
	
	return STREAM.concat( 
// DEMO PAGE SPECIFIC JS
		GULP.src( ['src/bootswatch/javascript/bootswatch_demo.js'] )
			.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/javascript' ) ) ),
			
// BOOTSTRAP BASED MAIN JS FILE
		// Process for development build
		GULP.src( ['src/components/bootstrap-sass/assets/javascripts/bootstrap.js'] )
			// Rename bootstrap.js
			.pipe( $.rename( 'app-main.js' ) )
			// Save for demo if not Production run
			.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/javascript' ) ) )
			// Prepend functions to resolve Bootstrap/JQuery-UI conflicts
			.pipe( $.injectString.prepend(UI_FIX) ) 
			// Save to relevant locations
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_ADMIN_SRC + '/javascript' ), 
				GULP.dest( DIST_ADMIN_DEV + '/javascript' ) ) 
			 )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_CATALOG_SRC + '/jscript' ), 
				GULP.dest( DIST_CATALOG_DEV + '/jscript' ) ) 
			 ),
			// Process for production build
			 GULP.src( ['src/components/bootstrap-sass/assets/javascripts/bootstrap.min.js'] )
				// Rename bootstrap.min.js
				.pipe( $.rename( 'app-main.min.js' ) )
				// Prepend functions to resolve Bootstrap/JQuery-UI conflicts
				.pipe( $.injectString.prepend(UI_FIX) ) 
				// Save to relevant locations
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/javascript' ) ) )
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_PROD + '/jscript' ) ) ),
			
// JQUERY
		GULP.src( ['src/components/jquery/dist/jquery.js'] )
			// Save to relevant locations
			.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/javascript' ) ) )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_ADMIN_SRC + '/javascript' ), 
				GULP.dest( DIST_ADMIN_DEV + '/javascript' ) ) 
			 )
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_CATALOG_SRC + '/jscript' ), 
				GULP.dest( DIST_CATALOG_DEV + '/jscript' ) ) 
			 ),
			// Process for production build
			GULP.src( ['src/components/jquery/dist/jquery.min.js'] )
				// Save to relevant locations
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/javascript' ) ) )
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_PROD + '/jscript' ) ) ),
				
// JQUERY-UI			
		GULP.src( ['src/components/jquery-ui/jquery-ui.js'] )
			// Save to relevant locations
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_ADMIN_SRC + '/javascript' ), 
				GULP.dest( DIST_ADMIN_DEV + '/javascript' ) ) 
			),
			// Process for production build
			GULP.src( ['src/components/jquery-ui/jquery-ui.min.js'] )
				// Save to relevant locations
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/javascript' ) ) ),
				
		// JQUERY-UI LOCALISATION FILES
		GULP.src(['src/components/jquery-ui/ui/i18n/*.js'])
			// Concatenate into a single file 
			.pipe( $.concat('jquery-ui-i18n.js') )
			// Prepend Licensing Information 
			.pipe( $.injectString.prepend("/*! jQueryUI i18n | Copyright jQuery Foundation and other contributors | MIT License */\n\n") )
			// Save to development or sources folders depending on whether this is a production run or not
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_ADMIN_SRC + '/javascript' ), 
				GULP.dest( DIST_ADMIN_DEV + '/javascript' ) ) 
			 )
			// Minify and save to production destination folders if this is a production run
			.pipe( $.cond(PRODUCTION, $.uglify({preserveComments:"license"}) ) )
			.pipe( $.cond(PRODUCTION, $.batchReplace(CLEAN_UP) ) )
			.pipe( $.cond(PRODUCTION, $.extname('.min.js') ) )
			.pipe( $.cond(PRODUCTION, GULP.dest(DIST_ADMIN_PROD + '/javascript') ) ),

// ADMIN EXTRA JS 			
		$.merge( app_extra, admin_extra )
			// Concatenate streams into a single file 
			.pipe( $.concat( 'admin-extra.js' ) )
			// Save to relevant locations
			.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_SRC + '/javascript' ) ) )
			.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_ADMIN_DEV + '/javascript' ) ) ),
			// Process for production build
			$.merge( app_extra, admin_extra )
				// Minify streams separately to maintain code blocks under licenses 
				.pipe( $.cond( PRODUCTION, $.uglify( {preserveComments:"license"} ) ) )
				// Concatenate minified streams into a single file and separate licensed sections
				.pipe( $.cond( PRODUCTION, $.concat( 'admin-extra.min.js' ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				// Save to relevant locations
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/javascript' ) ) ),
				
// CATALOG EXTRA JS 			
		$.merge( app_extra, catalog_extra )
			// Concatenate streams into a single file 
			.pipe( $.concat( 'catalog-extra.js' ) )
			// Save to relevant locations
			.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_SRC + '/jscript' ) ) )
			.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_CATALOG_DEV + '/jscript' ) ) ),
			// Process for production build
			$.merge( app_extra, catalog_extra )
				// Minify streams separately to maintain code blocks under licenses 
				.pipe( $.cond( PRODUCTION, $.uglify( {preserveComments:"license"} ) ) )
				// Concatenate minified streams into a single file and separate licensed sections
				.pipe( $.cond( PRODUCTION, $.concat( 'catalog-extra.min.js' ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				// Save to relevant locations
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_CATALOG_PROD + '/jscript' ) ) )
	 );
});

/*******************************
  ****************************
  * 08: PROCESS IMAGE FILES
  ****************************
********************************/
// Copy image files to the "zencart" folder
GULP.task( 'images', function() {
	return STREAM.concat( 
		GULP.src( ['src/bootswatch/images/**/*'] )
			// Process for demo in development build
			.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/images' ) ) ),
			
		GULP.src( ['src/assets/zc_admin/images/**/*'] )
			// Process for development build
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_ADMIN_PROD + '/images' ), 
				GULP.dest( DIST_ADMIN_DEV + '/images' ) 
			 ) ),
			
		GULP.src( ['src/assets/zc_catalog/images/**/*'] )
			// Process for development build
			.pipe( $.cond( PRODUCTION, 
				GULP.dest( DIST_CATALOG_PROD + '/images' ), 
				GULP.dest( DIST_CATALOG_DEV + '/images' ) 
			 ) )
	 );
});

/*******************************
  ****************************
  * 09: COPY ASSETS
  ****************************
********************************/
// Dispatcher to copy assets from "src/assets" folder
GULP.task( 'copy', function( done ) {
	$.sequence( ['copy:plugins', 'copy:font'], done );
});

// JS Plugins Builder
GULP.task( 'copy:plugins', function() {
	var retval; 
	if ( PRODUCTION ) {
    	// PROCESS PLUGINS FOR PRODUCTION RUNS ( WE END UP WITH ONLY SPECIFIC PLUGINS IN RETVAL VARIABLE )
    	retval = STREAM.concat( 
    	
// SELECT2 PLUGIN   	
    		// Minify and save select2 plugin js file to production destination folders
    		GULP.src( ['src/assets/plugins/select2/js/select2.full.js'] )
    			.pipe( GULP.dest( DIST_ADMIN_SRC + '/plugins/select2' ) )
				.pipe( $.uglify( {preserveComments:"license"} ) )
				.pipe( $.batchReplace( CLEAN_UP ) )
				.pipe( $.extname( '.min.js' ) )
				.pipe( GULP.dest( DIST_ADMIN_PROD + '/plugins/select2' ) ),
				
			// Select2 localisation files	
			GULP.src( ['src/assets/plugins/select2/js/i18n/**/*.js'] )
				// Remove repeated minimal individual licences
				.pipe( $.uglify( {compress:false} ) )
				// Concatenate into a single file 
				.pipe( $.concat('select2-i18n.js') )
				// Prepend Licensing Information 
				.pipe( $.injectString.prepend("/*!\n * Select2 4.0.3\n * https://select2.github.io\n * Copyright 2016\n *        Kevin Brown (https://github.com/kevin-brown)\n *        Igor Vaynberg (https://github.com/ivaynberg)\n *        Project Contributors (https://github.com/select2/select2/graphs/contributors)\n * Released under the MIT license\n * https://github.com/select2/select2/blob/master/LICENSE.md\n */\n") )
				// Save to development or sources folders depending on whether this is a production run or not
				.pipe( $.cond( PRODUCTION, 
					GULP.dest( DIST_ADMIN_SRC + '/plugins/select2' ), 
					GULP.dest( DIST_ADMIN_DEV + '/plugins/select2' ) ) 
				)
				// Minify and save to production destination folders if this is a production run
				.pipe( $.cond(PRODUCTION, $.uglify( {preserveComments:"license"} ) ) )
				.pipe( $.cond(PRODUCTION, $.batchReplace(CLEAN_UP) ) )
				.pipe( $.cond(PRODUCTION, $.extname('.min.js') ) )
				.pipe( $.cond(PRODUCTION, GULP.dest(DIST_ADMIN_PROD + '/plugins/select2') ) ),
				
			// Minify and save select2 plugin css files to production destination folders
			GULP.src( ['src/assets/plugins/select2/css/select2.css'] )
				// Apply CSS PostProcessing Rules
				.pipe( $.postcss( CSS_PROCESS ) )
				.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
				// Save to sources destination folder
				.pipe( GULP.dest( DIST_ADMIN_SRC + '/plugins/select2' ) )
				// Minify and save to production destination folder if this is a production run
				.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
				.pipe( GULP.dest( DIST_ADMIN_PROD + '/plugins/select2' ) ),

// GRIDSTACK PLUGIN   					
			// Minify and save gridstack plugin js files to production destination folders
			GULP.src( ['src/assets/plugins/gridstack/**/*.js'] )
				.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/plugins/gridstack' ) ) )
				.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_ADMIN_DEV + '/plugins/gridstack' ) ) )
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_SRC + '/plugins/gridstack' ) ) )
				.pipe( $.cond( PRODUCTION, $.uglify( {preserveComments:"license"} ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				.pipe( $.cond( PRODUCTION, $.extname( '.min.js' ) ) )
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/plugins/gridstack' ) ) ),
				
			// Minify and save gridstack plugin css files to production destination folders
			GULP.src( ['src/assets/plugins/gridstack/**/*.css'] )
				// Apply CSS PostProcessing Rules
				.pipe( $.postcss( CSS_PROCESS ) )
				.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
				// Save to sources destination folder
				.pipe( GULP.dest( DIST_ADMIN_SRC + '/plugins/gridstack' ) )
				// Minify and save to production destination folder if this is a production run
				.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
				.pipe( GULP.dest( DIST_ADMIN_PROD + '/plugins/gridstack' ) ),

// POPUPCALENDAR PLUGIN   					
			// Minify and save popupcalendar plugin js files to production destination folders
			GULP.src( ['src/assets/plugins/popupcalendar/**/*.js'] )
				.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/plugins/popupcalendar' ) ) )
				.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_ADMIN_DEV + '/plugins/popupcalendar' ) ) )
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_SRC + '/plugins/popupcalendar' ) ) )
				.pipe( $.cond( PRODUCTION, $.uglify( {preserveComments:"license"} ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				.pipe( $.cond( PRODUCTION, $.extname( '.min.js' ) ) )
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/plugins/popupcalendar' ) ) ),
				
			// Minify and save popupcalendar plugin css files to production destination folders
			GULP.src( ['src/assets/plugins/popupcalendar/**/*.css'] )
				// Apply CSS PostProcessing Rules
				.pipe( $.postcss( CSS_PROCESS ) )
				.pipe( $.autoprefixer( {browsers: COMPATIBILITY} ) )
				// Save to sources destination folder
				.pipe( GULP.dest( DIST_ADMIN_SRC + '/plugins/popupcalendar' ) )
				// Minify and save to production destination folder if this is a production run
				.pipe( $.cond( PRODUCTION, $.cssnano( {discardUnused: false} ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				.pipe( $.cond( PRODUCTION, $.extname( '.min.css' ) ) )
				.pipe( GULP.dest( DIST_ADMIN_PROD + '/plugins/popupcalendar' ) ),

// FLOT PLUGIN   					
			// Main Flot JS File
			GULP.src( ['src/assets/plugins/flot/jquery.flot.js'] )
				// Save to development destination folders
				.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/plugins/flot' ) ) )
				.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_ADMIN_DEV + '/plugins/flot' ) ) )
				// Save to production "sources" destination folders
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_SRC + '/plugins/flot' ) ) )
				// Minify and save to production destination folders
				.pipe( $.cond( PRODUCTION, $.uglify( {preserveComments:"license"} ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				.pipe( $.cond( PRODUCTION, $.extname( '.min.js' ) ) )
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/plugins/flot' ) ) ),
				
			// Flot Plugin Extensions
			GULP.src( PATHS.flot_plugins )
				// Concatenate into a single file
				.pipe( $.concat( 'jquery.flot-plugins.js' ) )
				// Save to development destination folders
				.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/plugins/flot' ) ) )
				.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_ADMIN_DEV + '/plugins/flot' ) ) )
				// Save to production "sources" destination folders
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_SRC + '/plugins/flot' ) ) )
				// Minify and save to production destination folders
				.pipe( $.cond( PRODUCTION, $.uglify( {preserveComments:"license"} ) ) )
				.pipe( $.cond( PRODUCTION, $.batchReplace( CLEAN_UP ) ) )
				.pipe( $.cond( PRODUCTION, $.extname( '.min.js' ) ) )
				.pipe( $.cond( PRODUCTION, GULP.dest( DIST_ADMIN_PROD + '/plugins/flot' ) ) )
		); 
	}
	return retval;
});

GULP.task( 'copy:demo:font', function() {
	return GULP.src( 'src/fonts/lato/fonts/**/*' )
		.pipe( $.cond( !PRODUCTION, GULP.dest( DIST_DEMO_DEV + '/fonts' ) ) );
});

GULP.task( 'copy:glypicons', function() {
	var destination = [];
	if( PRODUCTION ) {
		destination.push( 
			GULP.dest( DIST_ADMIN_SRC + '/fonts' ),
			GULP.dest( DIST_CATALOG_SRC + '/fonts' ),
        	GULP.dest( DIST_ADMIN_PROD + '/fonts' ),
        	GULP.dest( DIST_CATALOG_PROD + '/fonts' )
		 );
	} else {
		destination.push( 
			GULP.dest( DIST_ADMIN_DEV + '/fonts' ), 
			GULP.dest( DIST_CATALOG_DEV + '/fonts' )
		 );
	}
	return GULP.src( ['src/components/bootstrap-sass/assets/fonts/bootstrap/**/*'] )
		.pipe( $.multistream.apply( undefined, destination ) );
});

// Copy font assets to "zencart/**/fonts" floder
GULP.task( 'copy:font', ['copy:glypicons', 'copy:demo:font'], function() {
	var destination = [];
	if( PRODUCTION ) {
		destination.push( 
			GULP.dest( DIST_ADMIN_SRC + '/fonts' ),
			GULP.dest( DIST_CATALOG_SRC + '/fonts' ),
        	GULP.dest( DIST_ADMIN_PROD + '/fonts' ),
        	GULP.dest( DIST_CATALOG_PROD + '/fonts' )
		 );
	} else {
		destination.push( 
			GULP.dest( DIST_ADMIN_DEV + '/fonts' ), 
			GULP.dest( DIST_CATALOG_DEV + '/fonts' )
		 );
	}
	return GULP.src( FONT_PATH )
		.pipe( $.flatten() )
		.pipe( $.multistream.apply( undefined, destination ) );
});

/*******************************
  ****************************
  * 10: DEFAULT TASK
  ****************************
********************************/
// Build the site, run the server, and watch for file changes
GULP.task( 'default', ['server'], function() {
	GULP.watch( PATHS.assets, ['copy', BROWSER.reload] );
	GULP.watch( ['src/pages/**/*.html'], ['pages', BROWSER.reload] );
	GULP.watch( ['src/**/*.scss'], ['sass', BROWSER.reload] );
	GULP.watch( ['src/**/*.js'], ['javascript', BROWSER.reload] );
	GULP.watch( ['src/assets/{zc_admin,zc_catalog}/images/**/*'], ['images', BROWSER.reload] );
});