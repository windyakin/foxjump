#!/usr/bin/perl --

use strict;
use warnings;

use CGI::Carp qw(fatalsToBrowser);
use Data::Dumper;

use lib './lib';
use utf8;
use CGI;
use Encode;
use JSON;

exit(main());

sub main {
	
	my $query = new CGI;
	
	# ファイルハンドルを取得
	my $FileHandle = $query->upload("file");
	
	# アップロード情報を取得する
	my $upload_info = $query->uploadInfo($FileHandle);
	
	print "Content-type: text/plain; charset=UTF-8\n\n";
	my %info = (
		'time'			=> time, 
		'mine_type'		=> decode('UTF-8', $upload_info->{"Content-Type"}),
		'file_name'		=> decode('UTF-8', getFileName($FileHandle)),
	);
	
	print encode_json(\%info);
	
=pod
	print "Content-type: ".$mime_type."\n\n";
	#print $query->param("file");
	
	my $buffer;
	
	while (read($FileHandle, $buffer, 1024)) {
		print $buffer;
	}
=cut
	
	return 0;
}


sub getFileName()
{
	my ($string) = @_;
	return ($string =~ /([^\\\/:]+)$/) ? $1 : $string;
}

