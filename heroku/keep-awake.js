/**
 * run like:
 *      node heroku/keep-awake.js "https://my-domain.herokuapp.com/"
 */

/*!
 * @version 1.0 - 2013-05-21
 * @author Szymon Działowski
 * direction : 'rl'|'r'|'l'   -->   (undefined => 'rl')
 * charlist  : (undefined => " \n")
 */
function trim(string, charlist, direction) {
    direction = direction || 'rl';
    charlist  = (charlist || '').replace(/([.?*+^$[\]\\(){}|-])/g,'\\$1');
    charlist  = charlist || " \\n";
    (direction.indexOf('r')+1) && (string = string.replace(new RegExp('^(.*?)['+charlist+']*$','gm'),'$1'));
    (direction.indexOf('l')+1) && (string = string.replace(new RegExp('^['+charlist+']*(.*)$','gm'),'$1'));
    return string;
}

const domain = process.argv[2];

if ( ! domain ) {

    process.exit(1);
}

process.stdout.write(trim(domain, '/', 'r'));