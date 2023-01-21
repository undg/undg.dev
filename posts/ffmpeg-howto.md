---
title: FFmpeg HOWTO
description: Common resepies for ffmpeg
date: 2023-01-21
tags: video, linux, ffmpeg
    - post
layout: layouts/post.njk
---


%% ## Table of Contents
%%
%% * Generic Syntax
%% * Main Options
%% * Encoding :
%%     - D10 (aka Sony IMX)
%%     - DVCAM / DVCPRO25 / DVCPRO50
%%     - VC-3 (aka Avid DNxHD)
%%     - FFV1
%%     - H.264 I-frame only in Highest Quality
%%     - H.264 Long GOP
%%     - MPEG-2 I-frame only in Highest Quality
%%     - MPEG-2 Long GOP
%% * Muxing and Wrapping :
%%     - D10 into QuickTime ( for Final Cut Pro import )
%%     - MPEG-2 Program Stream
%% * Demuxing and Unwrapping :
%%     - MPEG-2 Program Stream
%% * Timecode Management :
%%     - MPEG-2 Start Timecode
%% * Misc :
%%     - Audio Volume Modification
%%     - Input Stream Selection
%%     - Sub-clip Creation
%%     - Make a Video File from a Single Frame

## Generic Syntax

`ffmpeg [[infile options][-i infile]]... {[outfile options] outfile}...`

Note : As a general rule, options are applied to the next specified file. Therefore, order is important and you can have the same option on the command line multiple times. Each occurrence is then applied to the next input or output file.



#### Main Options

* -ab <int> : Set audio bitrate in bit/s ( default = 64k ).
* -acodec <string> : Force audio codec.
   - aac : AAC-LC
   - ac3 : AC3 ( Dolby Digital )
   - copy : Copy raw codec data as is.
   - mp2 : MPEG Audio Layer II
   - mp3 : MPEG Audio Layer III
   - pcm_s16le : Uncompressed 16-bit PCM Audio
* -an : Disable audio.
* -ar <int> : Set audio sampling frequency in Hz ( default = 44100 Hz ).
* -aspect <string or float> : Set aspect ratio ( 4:3, 16:9, 1.3333, 1.7777 ).
* -async <int> : Audio sync method. Audio will be stretched or squeezed to match the timestamps. The parameter is the maximum samples per second by which the audio is changed. -async 1 is a special case where only the start of the audio stream is corrected without any later correction.
* -b <int> : Set video bitrate in bit/s ( default = 200k ).
* -bf <int> : Set number of B-frames ( supported for MPEG-1, MPEG-2 and MPEG-4 ).
* -b_strategy <boolean> : Strategy to choose between I/P/B-frames ( 0 = off / 1 = on ).
* -bufsize <int> : Set rate control buffer size ( in bits ).
* -cmp <string or int> : Full pel motion estimation compare function.
    - sad ( 0 ) : Sum of absolute differences, fast ( default ).
    - sse ( 1 ) : Sum of squared errors.
    - satd ( 2 ) : Sum of absolute Hadamard transformed differences.
    - dct ( 3 ) : Sum of absolute DCT transformed differences.
    - psnr ( 4 ) : Sum of squared quantization errors ( avoid, low quality ).
    - bit ( 5 ) : Number of bits needed for the block.
    - rd ( 6 ) : Rate distortion optimal, slow.
    - zero ( 7 ) : 0.
    - vsad ( 8 ) : Sum of absolute vertical differences.
    - vsse ( 9 ) : Sum of squared vertical differences.
    - nsse ( 10 ) : Noise preserving sum of squared differences.
    - w53 ( 11 ) : 5/3 wavelet ( only used in Snow ).
    - w97 ( 12 ) : 9/7 wavelet ( only used in Snow ).
    - dctmax ( 13 )
    - chroma ( 14 )
* -coder <string or int> :
    - vlc ( 0 ) : Variable length coder / huffman coder.
    - ac ( 1 ) : Arithmetic coder.
    - raw ( 2 ) : Raw ( no encoding ).
    - rle ( 3 ) : Run-length coder.
    - deflate ( 4 ) : Deflate-based coder.
* -cropbottom <int> : Set bottom crop band size ( in pixels ).
* -cropleft <int> : Set left crop band size ( in pixels ).
* -cropright <int> : Set right crop band size ( in pixels ).
* -croptop <int> : Set top crop band size ( in pixels ).
* -deinterlace : Deinterlace pictures.
* -dc <int> : Intra DC precision.
* -f <string> : Force file format.
    - ac3 : Raw AC3
    - avi : AVI
    - dv : DV
    - gxf : GXF ( General eXchange Format )
    - h264 : Raw H.264
    - m2v : MPEG-2 Video Elemetary Stream
    - m4v : MPEG-4 Video Elemetary Stream
    - mov : QuickTime
    - mp2 : MPEG Audio Layer II
    - mp3 : MPEG Audio Layer III
    - mp4 : MP4
    - mpeg : MPEG-1 System Stream
    - mpegts : MPEG-2 Transport Stream
    - rawvideo : RAW Video
    - vob : MPEG-2 Program Stream
    - wav : WAV
* -flags <string> :
    - aic : H.263 advanced intra coding / MPEG-4 ac prediction.
    - aiv : H.263 alternative inter VLC.
    - alt : Enable alternate scantable ( MPEG-2/MPEG-4 ).
    - bitexact : Use only bitexact stuff ( except (i)dct ).
    - cbp : Use rate distortion optimization for cbp.
    - cgop : Closed GOP.
    - gmc : Use global motion compensation.
    - gray : Only decode/encode grayscale.
    - ildct : Use interlaced DCT.
    - ilme : Interlaced motion estimation.
    - loop : Use loop filter.
    - low_delay : Force low delay.
    - mv0 : Always try a mb with mv=<0,0>.
    - mv4 : Use four motion vector by macroblock ( MPEG-4 ).
    - naq : Normalize adaptive quantization.
    - obmc : Use overlapped block motion compensation ( H.263+ ).
    - part : Use data partitioning.
    - psnr : Error variables will be set during encoding.
    - qpel : Use 1/4 pel motion compensation.
    - qprd : Use rate distortion optimization for qp selection.
    - scan_offset : Will reserve space for svcd scan offset user data.
    - slice
    - trell : Use trellis quantization.
    - umv : Use unlimited motion vectors.
* -flags2 <string> :
    - aud : Access unit delimiters ( H.264 ).
    - bpyramid : Allows B-frames to be used as references for predicting.
    - brdo : B-frame rate-distortion optimization.
    - dct8x8 : High profile 8x8 transform ( H.264 ).
    - drop_frame_timecode
    - fast : Allow non-spec compliant speedup tricks.
    - fastpskip : Fast pskip ( H.264 ).
    - ivlc : Intra VLC table.
    - local_header : Place global headers at every keyframe instead of in extradata.
    - mixed_refs : One reference per partition, as opposed to one reference per macroblock.
    - non_linear_q : Use non-linear quantizer.
    - noout : Skip bitstream encoding.
    - sgop : Strictly enforce GOP size.
    - skiprd : RD optimal macroblock level residual skipping.
    - wpred : Weighted biprediction for B-frames ( H.264 ).
* -formats : Show available formats, codecs, protocols, etc.
* -g <int> : Set the group of pictures ( GOP ) size.
* -genpts <boolean> : Generate PTS ( 0 = off / 1 = on ).
* -h : Show help.
* -i <string> : Input file name.
* -intra : Use only intra frames ( I-frames ).
* -loop_input : Loop ( only works with still images ).
* -map <file:stream>[:syncfile:syncstream] : Set input stream mapping.
* -maxrate <int> : Set maximum video bitrate tolerance ( in bit/s ).
* -me <string or int> : Set motion estimation method.
    - dia ( 1 ) : Diamond search, radius 1 ( fast ).
    - hex ( 2 ) : Hexagonal search, radius 2 ( default ).
    - umh ( 3 ) : Uneven multi-hexagon search.
    - esa ( 4 ) : Exhaustive search ( slow ).
* -mbd <string> : Macroblock decision algorithm ( high quality mode ).
    - simple : Use mbcmp ( default ).
    - bits : Use the fewest bits.
    - rd : Use best rate distortion.
* -minrate <int> : Set minimum video bitrate tolerance ( in bit/s ).
* -padbottom <int> : Set bottom pad band size ( in pixels ).
* -padcolor <int> : Set color of pad bands ( Hex 000000 to FFFFFF ).
* -padleft <int> : Set left pad band size ( in pixels ).
* -padright <int> : Set right pad band size ( in pixels ).
* -padtop <int> : Set top pad band size ( in pixels ).
* -pass <int> : Select the pass number ( 1 or 2 ). The statistics of the video are recorded in the first pass, and the video is generated at the exact requested bitrate in the second pass.
* -pix_fmt <string> : Set pixel format.
    - yuv420p
    - yuv422p
    - yuv444p
    - yuv422
    - yuv410p
    - yuv411p
    - yuvj420p
    - yuvj422p
    - yuvj444p
    - rgb24
    - bgr24
    - rgba32
    - rgb565
    - rgb555
    - gray
    - monow
    - monob
    - pal8
* -ps <int> : Set packet size in bits.
* -qmax <int> : Maximum video quantizer scale ( VBR ).
* -qmin <int> : Minimum video quantizer scale ( VBR ).
* -r <int or string> : Set frame rate ( Hz value, fraction or abbreviation ). For example : 25, 30000/1001, etc.
* -rc_init_occupancy <int> : Number of bits which should be loaded into the rate control buffer before decoding starts.
* -s <string> : Set frame size ( WidthxHeight or abreviation ).
* -subcmp <string or int> : Sub pel motion estimation compare function.
    - sad ( 0 ) : Sum of absolute differences, fast ( default ).
    - sse ( 1 ) : Sum of squared errors.
    - satd ( 2 ) : Sum of absolute Hadamard transformed differences.
    - dct ( 3 ) : Sum of absolute DCT transformed differences.
    - psnr ( 4 ) : Sum of squared quantization errors ( avoid, low quality ).
    - bit ( 5 ) : Number of bits needed for the block.
    - rd ( 6 ) : Rate distortion optimal, slow.
    - zero ( 7 ) : 0.
    - vsad ( 8 ) : Sum of absolute vertical differences.
    - vsse ( 9 ) : Sum of squared vertical differences.
    - nsse ( 10 ) : Noise preserving sum of squared differences.
    - w53 ( 11 ) : 5/3 wavelet ( only used in Snow ).
    - w97 ( 12 ) : 9/7 wavelet ( only used in Snow ).
    - dctmax ( 13 )
    - chroma ( 14 )
* -ss <timecode> : Set start time offset in seconds or hh:mm:ss[.xxx] format.
* -t <timecode> : Set recording time in seconds or hh:mm:ss[.xxx] format.
* -timecode_frame_start <int> : Set GOP start timecode value in number of frames ( ex: 1282748 for 14:15:09:23 ). Drop Frame mode is not supported.
* -top <int> : Field dominance ( top = 1 / bottom = 0 / auto = -1 ).
* -trellis <int> : Rate-distortion optimal quantization.
* -vbsf <string> : Bitstream filters.
    - dump_extra
    - imxdump
    - noise
    - remove_extra
* -vcodec <string> : Force video codec.
    - copy : Copy raw codec data as is.
    - dvvideo : DV Video
    - ffv1 : FFV1 lossless video codec
    - h264 : H.264
    - mpeg2video : MPEG-2 Video
    - rawvideo : RAW Video
    - xvid : XviD ( MPEG-4 Part 2 )
* -version : Show version.
* -vframes <int> : Set the number of video frames to record.
* -vn : Disable video.
* -vol <int> : Modify audio volume ( 256=normal ).
* -vsync <int> : Video sync method. Video will be stretched or squeezed to match the timestamps, it is done by duplicating and dropping frames. With -map option, you can select from which stream the timestamps should be taken. You can leave either video or audio unchanged and sync the remaining stream(s) to the unchanged one.
* -vtag <string> : Force video FourCC/Tag.
* -y : Overwrite output files.

#### D10 (aka Sony IMX) Encoding

`ffmpeg -async 1 -i <input_file> -vcodec mpeg2video -r 25 -pix_fmt yuv422p -minrate 50000k -maxrate 50000k -b 50000k -intra -flags +ildct+low_delay -dc 10 -flags2 +ivlc+non_linear_q -ps 1 -qmin 1 -qmax 3 -top 1 -bufsize 2000000 -rc_init_occupancy 2000000 -rc_buf_aggressivity 0.25 -an output.m2v `

##### Notes :

- Only works for 25 fps content.
- Change minrate, maxrate and b values to 30000k / 40000k / 50000k to produce 30/40/50 Mbps D10 essence.
- Set bufsize and rc_init_occupancy values to 1200000 / 1600000 / 2000000 for 30/40/50 Mbps D10 essence.
- Add the -padtop 32 option if you want to produce a 720x608 D10 image size from a 720x576 source.



#### DVCAM / DVCPRO25 / DVCPRO50 Encoding

`ffmpeg -i <input_file> -pix_fmt yuv420p output_DVCAM.dv `
`ffmpeg -i <input_file> -pix_fmt yuv411p output_DVCPRO25.dv `
`ffmpeg -i <input_file> -pix_fmt yuv422p output_DVCPRO50.dv `



#### VC-3 (aka Avid DNxHD) Encoding

`ffmpeg -i <input_file> -vcodec dnxhd -b <bitrate> -an output.mov `

##### Notes :
- <bitrate> can take the following values : 36Mb, 120Mb, 185Mb ( please refer to the following table ).
- Add the following option for interlaced modes : -flags +ildct
- Add the following option for best quality mode ( very slow ! ) : -mbd rd

##### Supported Resolutions :

| Project Format | Resolution | Frame Size  | Bits | FPS    | bitrate |
|----------------|------------|-------------|------|--------|---------|
| 1080i / 59.94  | DNxHD 220  | 1920 x 1080 | 8    | 29.97  | 185Mb   |
| 1080i / 59.94  | DNxHD 145  | 1920 x 1080 | 8    | 29.97  | 120Mb   |
| 1080i / 50     | DNxHD 185  | 1920 x 1080 | 8    | 25     | 185Mb   |
| 1080i / 50     | DNxHD 120  | 1920 x 1080 | 8    | 25     | 120Mb   |
| 1080p / 25     | DNxHD 185  | 1920 x 1080 | 8    | 25     | 185Mb   |
| 1080p / 25     | DNxHD 120  | 1920 x 1080 | 8    | 25     | 120Mb   |
| 1080p / 25     | DNxHD 36   | 1920 x 1080 | 8    | 25     | 36Mb    |
| 1080p / 24     | DNxHD 175  | 1920 x 1080 | 8    | 24     | 185Mb   |
| 1080p / 24     | DNxHD 115  | 1920 x 1080 | 8    | 24     | 120Mb   |
| 1080p / 24     | DNxHD 36   | 1920 x 1080 | 8    | 24     | 36Mb    |
| 1080p / 23.976 | DNxHD 175  | 1920 x 1080 | 8    | 23.976 | 185Mb   |
| 1080p / 23.976 | DNxHD 115  | 1920 x 1080 | 8    | 23.976 | 120Mb   |
| 1080p / 23.976 | DNxHD 36   | 1920 x 1080 | 8    | 23.976 | 36Mb    |
| 1080p / 29.7   | DNxHD 45   | 1920 x 1080 | 8    | 29.97  | 36Mb    |
|----------------|------------|-------------|------|--------|---------|




#### FFV1 Encoding

`ffmpeg -i <input_file> -vcodec ffv1 -an output.mov`



#### H.264 I-frame only Highest Quality Encoding

`ffmpeg -i <input_file> -vcodec h264 -cqp 1 -intra -coder ac -an output.mp4`



#### H.264 Long GOP Encoding

`ffmpeg -i <input_file> -vcodec h264 -b <video_bitrate> -g <gop_size> -bf 2 -b_strategy 1 -flags +loop -coder 1 -subcmp 2 -cmp 2 -trellis 2 -me hex -acodec aac -ab <audio_bitrate> output.mp4`



#### MPEG-2 I-frame only Highest Quality Encoding

`ffmpeg -i <input_file> -vcodec mpeg2video -qscale 1 -qmin 1 -intra -an output.m2v`



#### MPEG-2 Long GOP Encoding

`ffmpeg -i <input_file> -vcodec mpeg2video -b <video_bitrate> -g <gop_size> -bf 2 -b_strategy 1 -acodec mp2 -ab <audio_bitrate> -f vob output.mpg`



#### D10 into QuickTime Wrapping

`ffmpeg -i <input_file> -vcodec copy -acodec pcm_s16le -vtag mx5p -vbsf imxdump output.mov`

##### Notes :
- This feature needs a patched version of FFmpeg not available in the current SVN, please contact Baptiste Coudurier or Olivier Amato for more information.
- Set -vtag to mx3p / mx4p / m5xp for D10 30/40/50 PAL or mx3n / mx4n / m5xn for D10 30/40/50 NTSC.
- Input D10 image size must be 720x608 ( use -padtop 32 option during D10 encoding if the original image size is 720x576 ).
- Final Cut Pro compliant.



#### MPEG-2 Program Stream Muxing

`ffmpeg -genpts 1 -i ES_Video.m2v -i ES_Audio.mp2 -vcodec copy -acodec copy -f vob output.mpg`



#### MPEG-2 Program Stream Demuxing

`ffmpeg -i input.mpg -vcodec copy -f mpeg2video ES_Video.m2v -acodec copy -f mp2 ES_Audio.mp2`

Note : This also works for files containing multiple audio tracks :
`ffmpeg -i input.mpg -vcodec copy -f mpeg2video ES_Video.m2v -acodec copy -f mp2 ES_Audio1.mp2 -acodec copy -f mp2 ES_Audio2.mp2`



#### MPEG-2 Start Timecode

`ffmpeg -i <input_file> -timecode_frame_start <start_timecode> -vcodec mpeg2video -an output.m2v`

Note : Start timecode is set as number of frames. For instance, if you want to start at 18:12:36:15, you will have to set -timecode_frame_start to 1638915 ( for 25 fps content ).



#### Audio Volume Modification

`ffmpeg -i <input_file> -vol <audio_volume> -acodec <audio_codec> <output_file>`



#### Input Stream Selection

`ffmpeg -i input.vob -map 0:2 -acodec aac -ab <audio_bitrate> -vn output.mp4`

Transcode audio stream #0:2.



#### Sub-clip Creation

`ffmpeg -i <input_file> -ss <timecode> -t <timecode> -vcodec copy -acodec copy <output_file>`



#### Make a Video File from a Single Frame

`ffmpeg -loop_input -vframes <number_of_frames> -i <input_file> <output_file>`

## [DaVinci Resolve cheatsheet](https://alecaddd.com/davinci-resolve-ffmpeg-cheatsheet-for-linux/)

### Convert MP4 to MOV

This is the command I use to convert a MP4 file recorded from a video camera to a MOV format of the same quality that DaVinci Resolve can import and read.

`ffmpeg -i input.mp4 -vcodec dnxhd -acodec pcm_s16le -s 1920x1080 -r 30000/1001 -b:v 36M -pix_fmt yuv422p -f mov output.mov`


### Convert MKV to MOV with Multiple Audio Tracks

This command seems a bit far-fetched, but if you’re on Linux like me, you’d know that recording multiple audio tracks from OBS is only supported with the MKV video format. Since DaVinci Resolve doesn’t support MVK, here’s the command I use to convert that file into a readable MOV while keeping the audio on their separated tracks.

`ffmpeg -i input.mkv -map 0:0 -map 0:1 -map 0:2 -vcodec dnxhd -acodec:0 pcm_s16le -acodec:1 pcm_s16le -s 1920x1080 -r 30000/1001 -b:v 36M -pix_fmt yuv422p -f mov output.mov`

### Convert MP4 to MOV

When it comes to rendering a file from DaVinci Resolve, I was forced to stick with the MOV format with some high video/audio codec settings. The rendered file is not small, but nonetheless, FFmpeg is more than capable of handling it and converting it into a slim and crisp MP4.

### Convert MOV to MP4

The settings I’m using are those recommended by YouTube for a fast upload and a almost zero processing.
If the file size is too big, you can control the quality with the -crf 1 option, changing the number up until 25, where a higher number means lower quality.

`ffmpeg -i input.mov -vf yadif -codec:v libx264 -crf 1 -bf 2 -flags +cgop -pix_fmt yuv420p -codec:a aac -strict -2 -b:a 384k -r:a 48000 -movflags faststart output.mp4`


