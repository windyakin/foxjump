(function(){

$(function(){
	
	var userAgent = window.navigator.userAgent.toLowerCase();
	// if firefox (labelをクリックしてもfile選択ダイアログがでない場合)
	if (userAgent.indexOf("firefox") != -1 || userAgent.indexOf('gecko') != -1) {
		$("#file_select label").click(function (e) {
				$("#" + $(this).attr("for")).click();
				return false;
		});
	}
	
	$("#debug").text("ファイルを選択してください");
	
	// ファイルが選択されたら
	$("#file").change(function(){
		// 値を取得
		var file = new File($(this).val());
		
		$("#extra_input").slideDown();
		$("#file_select").slideUp();
		
		$("#filename").text(file.getShortName(30));
		
		// 拡張子による必須入力項目のハイライトなど
		judgeExtension(file.ext);
		
	});
	
	// クリアボタンが押されたら
	$(".clear").click(function(){
		$("#upload")[0].reset();
		$("#extra_input").slideUp();
		$("#file_select").slideDown();
	});
	
	// FormDataとFileAPIに対応していれば
	if ( window.FormData && window.File ) {
		uploadModernBrowser();
	}
	// 非対応であれば
	else {
		uploadLegacyBrowser();
	}
	
});

// ファイル名
var File = function(fullpass){
	fullpass.match(/([^\\\/]*?)(\.([^.]+))?$/);
	this.name = RegExp.$1;
	this.ext = RegExp.$3;
};
File.prototype.getFullName = function(){
	var fullname = this.name;
	if (this.ext) fullname += '.' + this.ext;
	return fullname;
};
File.prototype.getShortName = function(len){
	var shortname = this.name;
	if ( strlen(shortname) > len ) {
		shortname = mysubstr(shortname, 0, len-2) + '…';
	}
	if (this.ext) shortname += '.' + this.ext;
	return shortname;
};

var rule = "rule_20130325";

// 文字数カウント
function strlen(str) {
	var len = 0;
	for (var i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) >= 128) len+=2;
		else len++;
	}
	return len;
}
// 文字列切り出し
function mysubstr(str, off, len)
{
	for (var i = 0; i < off; i++) if (str.charCodeAt(i) >= 128) off--;
	for (var i = off; i < off+len; i++) if (str.charCodeAt(i) >= 128) len--;
	return str.substr(off, len);
}

function judgeExtension(ext)
{
	var info = null;
	// アップロードできる拡張子の一覧表を取得
	$.ajax("/setting/acceptExt.json", {
		type: 'get',
		dataType: 'json',
	})
	// 成功した時
	.done(function(json){
		// 対応している拡張子かチェック
		$.each(json.acceptExt, function(index, val){
			if (val.ext == ext) info = val;
		});
	});
}

// 利用規約の同意を求める
function checkRuleAgreement()
{
	// 同意していなければ同意を求める
	$.ajax("/rule.html", {
		type: 'get',
		cache: false,
		dataType: 'html',
	})
	.done(function(data){
		// 利用規約のウィンドウを表示
		$("#blackout").fadeIn()
		// 取得した利用規約文を挿入
		$("#rule_ajax").html($("<div>").append($.parseHTML(data)).find("#rule_text").html());
		
		// キャンセルがクリックされたらなかったことにする
		$(".clear").click(function(){
			$("#blackout").fadeOut();
		});
		$("#rule_submit").click(function(){
			if ( $("#agree").is(':checked') ) {
				// クッキーを発行
				$.cookie(rule, "1");
				$("#blackout").fadeOut();
				// クリックしたことにする
				$("#submit").trigger('click');
			}
			else {
				// 同意するにチェックしてよ～
				$("#agree_label").css({"color": "#880000", "font-weight": "bold"});
			}
		});
	});
}

function uploadModernBrowser()
{
	$("#submit").click(function(){
	
		// 利用規約に同意していなければ利用規約を表示
		if ( !$.cookie(rule) ){
			checkRuleAgreement();
		}
		// 利用規約に同意していればアップロード開始
		else {
			
			$("#loading").fadeIn();
			$("#progress_mes").text("アップロード中です... 0%")
			
			// FormDataの生成
			var fd = new FormData($("#upload")[0]);
			
			// ajaxでアップロード
			$.ajax($("#upload").attr("action"), {
				type: 'post',
				processData: false,
				contentType: false,
				data: fd,
				dataType: 'json',
				// アップロード進行状況
				xhr: function(){
					XHR = $.ajaxSettings.xhr();
					if (XHR.upload) {
						XHR.upload.addEventListener('progress', function(e){
							progre = parseInt(e.loaded/e.total*100);
							$("#progress_bar").css("width", progre+"%");
							$("#progress_mes").text("アップロード中です... "+progre+"%")
						}, false); 
					}
					return XHR;
				},
			})
			.done(function(data){
				$("#progress_bar").css("width", "100%");
				$("#progress_mes").text("アップロード完了 100%");
				console.dir(data);
			})
			.fail(function(data, status, errorThrown){
				$("#progress_bar").css({"background": "#880000", "width": "100%"});
				$("#progress_mes").text("エラーが発生しました ["+status+"]");
			})
			.always(function(){
				// 完了画面を１秒のみ表示してフォーム情報をクリア
				$(".clear").delay(1000).queue(function(next){
					$("#loading").fadeOut();
					$(this).trigger('click');
					next();
				});
			});
		}
	});
}

function uploadLegacyBrowser()
{
	// 警告を表示
	$("#alert_legacy").show();
	
	// iframeをつかった擬似ajaxアップロードに対応する
	$("#upload").attr("target", "iframe_upload");
	
	$("#submit").click(function(){
		$("#upload").submit();
		$("#loading").fadeIn();
		$("#progress_bar").css({"width": "100%", "background": "url(/img/loading.gif)"});
		$("#progress_mes").css({"background": "url(/img/alpha.png)"}).text("アップロード中です...");
		return false;
	});
	
	$("#upload").submit(function(){
		$("#iframe_upload").unbind().bind('load', function(){
			// 戻り値をjsonとして扱う
			var data = $.parseJSON($("#iframe_upload").contents().text());
			console.dir(data);
			$("#progress_bar").css({"background": ""});
			$("#progress_mes").css({"background": ""}).text("アップロード完了");
			$(".clear").delay(1000).queue(function(next){
				$("#loading").fadeOut();
				$(this).trigger('click');
				next();
			});
		});
	});
}

})();
