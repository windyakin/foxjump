#!/usr/bin/perl

use strict;
use warnings;
use CGI::Carp qw(fatalsToBrowser);

use CGI;

exit(main());

sub main {
	
	my $query = new CGI;
	
	# ファイルハンドルを取得
	my $FileHandle = $query->upload("file");
	
	# アップロード情報を取得する
	my $upload_info = $query->uploadInfo($FileHandle);
	my $mime_type = $upload_info->{"Content-Type"};
	
	#print "Content-type: text/plain\n\n";
	print "Content-type: ".$mime_type."\n\n";
	#print $query->param("file");
	
	my $buffer;
	
	while (read($FileHandle, $buffer, 1024)) {
		print $buffer;
	}
	
	return 0;
}
