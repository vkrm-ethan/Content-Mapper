$(document).ready(function(){
	var res = $(".keyColor");
	console.log(res)
	var siz = res.length;
	var i=0;
	for(i=0;i<siz;i++){
		var sol =res[i].innerText;
		console.log(sol);
		res[i].innerText=convertjEsc2CP(sol);
	}
	$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}
$('select[name^="marketName"] option[value="'+$.urlParam('marketName')+'"]').attr("selected","selected");
$('select[name^="propTypes"] option[value="'+$.urlParam('propTypes')+'"]').attr("selected","selected");
});	

var debug1 = true;
var debug2 = true;
var escapeMap = '';
var CPstring = '';


var hexNum = { 0:1, 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 
				A:1, B:1, C:1, D:1, E:1, F:1, 
				a:1, b:1, c:1, d:1, e:1, f:1 };
var jEscape = { 0:1, b:1, t:1, n:1, v:1, f:1, r:1 };
var decDigit = { 0:1, 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1 };

function dec2hex ( textString ) {
 return (textString+0).toString(16).toUpperCase();
}
function getCPfromChar ( textString ) {
	// converts a character or sequence of characters to hex codepoint values
	// copes with supplementary characters
	// returned values include a space between each hex value and at the end
	var codepoint = "";
	var haut = 0;
	var n = 0; 
	for (var i = 0; i < textString.length; i++) {
		var b = textString.charCodeAt(i); 
		if (b < 0 || b > 0xFFFF) {
			codepoint += 'Error: Initial byte out of range in getCPfromChar: '+dec2hex(b);
			}
		if (haut != 0) { // we should be dealing with the second part of a supplementary character
			if (0xDC00 <= b && b <= 0xDFFF) {
				codepoint += dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)) + ' ';
				haut = 0;
				continue;
				}
			else {
				codepoint += 'Error: Second byte out of range in getCPfromChar: '+dec2hex(haut);
				haut = 0;
				}
			}
		if (0xD800 <= b && b <= 0xDBFF) { //b is the first part of a supplementary character
			haut = b;
			}
		else { // this is not a supplementary character
//			codepoint += dec2hex(b);
			codepoint += b.toString(16).toUpperCase()+' ';
			}
		} 
 //alert('>'+codepoint+'<');
	return codepoint;
	}
function convertCP2Char ( textString ) {
  var outputString = '';
  textString = textString.replace(/^\s+/, '');
  if (textString.length == 0) { return ""; }
  	textString = textString.replace(/\s+/g, ' ');
  var listArray = textString.split(' ');
  for ( var i = 0; i < listArray.length; i++ ) {
    var n = parseInt(listArray[i], 16);
    if (n <= 0xFFFF) {
      outputString += String.fromCharCode(n);
    } else if (n <= 0x10FFFF) {
      n -= 0x10000
      outputString += String.fromCharCode(0xD800 | (n >> 10)) + String.fromCharCode(0xDC00 | (n & 0x3FF));
    } else {
      outputString += 'convertCP2Char error: Code point out of range: '+dec2hex(n);
    }
  }
  return( outputString );
}
function convertCP2jEsc () {
	var outputString = '';
	if (CPstring == '') { return ""; }
	var listArray = CPstring.split(' ');
	for ( var i = 0; i < listArray.length; i++ ) {
		code = parseInt(listArray[i], 16);

		switch (code) {
			case 0: outputString += '\\0'; break;
			case 8: outputString += '\\b'; break;
			case 9: outputString += '\\t'; break;
			case 10: outputString += '\\n'; break;
			case 13: outputString += '\\r'; break;
			case 11: outputString += '\\v'; break;
			case 12: outputString += '\\f'; break;
			case 34: outputString += '\\\"'; break;
			case 39: outputString += '\\\''; break;
			case 92: outputString += '\\\\'; break;
			default: if (code > 0x1f && code < 0x7F) { outputString += String.fromCharCode(code); }
					else if (code > 0xFFFF) { 
						code -= 0x10000
						outputString += '\\u'+ dec2hex4(0xD800 | (code >> 10)) +'\\u'+ dec2hex4(0xDC00 | (code & 0x3FF));
						}
					else { 
						pad = '';
						if (listArray[i].length == 1) { pad = '000'; }
						else if (listArray[i].length == 2) { pad = '00'; }
						else if (listArray[i].length == 3) { pad = '0'; }
						outputString += '\\u'+pad+listArray[i]; 
						}
			}
		}
	return( outputString );
	}

function convertChar2CP ( textString ) { 
	var haut = 0;
	var n = 0;
	CPstring = '';
	for (var i = 0; i < textString.length; i++) {
		var b = textString.charCodeAt(i); 
		if (b < 0 || b > 0xFFFF) {
			CPstring += 'Error ' + dec2hex(b) + '!';
			}
		if (haut != 0) {
			if (0xDC00 <= b && b <= 0xDFFF) {
				CPstring += dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)) + ' ';
				haut = 0;
				continue;
				}
			else {
				CPstring += '!erreur ' + dec2hex(haut) + '!';
				haut = 0;
				}
			}
		if (0xD800 <= b && b <= 0xDBFF) {
			haut = b;
			}
		else {
			CPstring += dec2hex(b) + ' ';
			}
		}
	CPstring = CPstring.substring(0, CPstring.length-1);

	document.getElementById("transText").value=convertCP2jEsc( CPstring );
	
	}
function convertjEsc2CP ( textString ) { 
	// convert whole string to chars before starting (allows for mixed strings)
	CPstring = '';
	textString += ' ';
	var tempString = '';
	var charStr = '';

	// first convert whole string to characters
	for (var i=0; i<textString.length-1; i++) {   
		if (i<textString.length-8 && textString.charAt(i) == '\\' 
			&& textString.charAt(i+1) == 'U' && textString.charAt(i+2) in hexNum
			&& textString.charAt(i+3) in hexNum && textString.charAt(i+4) in hexNum
			&& textString.charAt(i+5) in hexNum && textString.charAt(i+6) in hexNum
			&& textString.charAt(i+7) in hexNum && textString.charAt(i+8) in hexNum
			&& textString.charAt(i+9) in hexNum) { // \Uxxxxxxxx
			tempString = '';
			i += 2;
			for (var j=0; j<8; j++) {
				tempString += textString.charAt(i+j);
				}
			i += 7;
			charStr += convertCP2Char(tempString); 
			}
		else if (i<textString.length-6 && textString.charAt(i) == '\\' 
			&& textString.charAt(i+1) == 'u' && textString.charAt(i+2) in hexNum
			&& textString.charAt(i+3) in hexNum && textString.charAt(i+4) in hexNum
			&& textString.charAt(i+5) in hexNum) { // \uxxxx
			tempString = '';
			i += 2;
			for (var j=0; j<4; j++) {
				tempString += textString.charAt(i+j);
				}
			i += 3;
			charStr += convertCP2Char(tempString); 
			}
		else if (i<textString.length-2 && textString.charAt(i) == '\\' 
			&& (textString.charAt(i+1) in jEscape || textString.charAt(i+1) == "\""
			 || textString.charAt(i+1) == "\'"  || textString.charAt(i+1) == "\\")) { // \x
			switch (textString.charAt(i+1)) {
				case '0': charStr += '\0'; break;
				case 'b': charStr += '\b'; break;
				case 't': charStr += '\t'; break;
				case 'n': charStr += '\n'; break;
				case 'v': charStr += '\v'; break;
				case 'f': charStr += '\f'; break;
				case 'r': charStr += '\r'; break;
				case '\'': charStr += '\''; break;
				case '\"': charStr += '\"'; break;
				case '\\': charStr += '\\'; break;
				}
			i += 1;
			}
		else { 
			charStr += textString.charAt(i);
			}
		} 
//alert('charStr='+charStr+'<'+charStr.length);
		
	CPstring = getCPfromChar( charStr ); 
	CPstring = CPstring.substring(0, CPstring.length-1);
//alert('CPstring='+CPstring+'<'+CPstring.length);


	return convertCP2Char( CPstring );
}
	
var TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtType.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

        var that = this;
        var delta = 200 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
        }

        setTimeout(function() {
        that.tick();
        }, delta);
    };

    window.onload = function() {
        var elements = document.getElementsByClassName('typewrite');
		$("input[name = 'inputText']").val(window.localStorage['text1_val']);
		convertChar2CP(window.localStorage['text1_val']);
        window.localStorage['text1_val'] = ''; 
        for (var i=0; i<elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-type');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
              new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
        document.body.appendChild(css);
	}
function submitSearch(){
	window.localStorage['text1_val'] = $("input[name = 'inputText']").val(); 
	$('#mainComponent').css('visibility', 'hidden');
    $('#gif').css('visibility', 'visible');
}