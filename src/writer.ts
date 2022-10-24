import fs from "fs";
import path from "path";
import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
ffmpeg.setFfmpegPath(ffmpegPath);

import { FileWriterConfig, VidIndex } from "./types";
export default class FileWriter {
  private index_loc_: string;
  private count_ = 0;
  private fps_: number;
  private cam_name_: string;
  private config_: FileWriterConfig;

  private in_stream_: PassThrough;

  private index_: VidIndex;
  private to_delete_: Array<string> = [];

  constructor(cam_name: string, fps: number, config: FileWriterConfig) {
    this.cam_name_ = cam_name;
    this.fps_ = fps;
    this.config_ = config;
    try {
      fs.mkdirSync(this.config_.save_dir, { recursive: true });
    } catch (error) {
      console.warn(error);
    }
    this.index_loc_ = path.join(this.config_.save_dir, `.${this.config_.id}_index.json`);
    this.ReadIndex();

    this.DeleteExpired();

    if (!this.config_.on_motion) {
      this.CreateFileWriter();
      setInterval(() => { this.CreateFileWriter(); }, this.config_.vid_length);
    }

    setInterval(() => {
      this.DeleteExpired();
    }, Math.max(this.config_.vid_length, 60 * 1000));
  }

  static GetIndex(config: FileWriterConfig): VidIndex {
    const index_loc_ = path.join(config.save_dir, `.${config.id}_index.json`);
    try {
      const data = fs.readFileSync(index_loc_).toString();
      return JSON.parse(data);
    } catch (error) {
      console.warn(error);
      return { videos: [] };
    }
  }

  MotionStart(back_queue: Array<Buffer>) {
    if (this.config_.on_motion) {
      this.CreateFileWriter();
      for (let i = 0; i < back_queue.length; i++) { this.WriteFrame(back_queue[i]); }
    }
  }

  MotionStop() {
    if (this.config_.on_motion) {
      if (this.in_stream_) this.in_stream_.end();
      this.in_stream_ = undefined;
    }
  }

  WriteFrame(frame: Buffer) {
    if (this.in_stream_) {
      this.count_++;
      if (this.count_ == this.config_.frame_rate_scale) {
        this.count_ = 0;
        this.in_stream_.write(frame);
      }
    }
  }

  private GenerateFilename(timestamp: number): string {
    let filename = this.config_.name_format;
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    const hour = ("0" + d.getHours()).slice(-2);
    const min = ("0" + d.getMinutes()).slice(-2);
    const sec = ("0" + d.getSeconds()).slice(-2);

    const date = `${year}_${month}_${day}`;
    const time = `${hour}-${min}-${sec}`;

    filename = filename.replace("{NAME}", this.cam_name_);
    filename = filename.replace("{DATE}", date);
    filename = filename.replace("{TIME}", time);
    filename = filename.replace(/[/\\?%*:|"<>]/g, "-"); // filter out invalid filenames
    return filename + ".mp4";
  }

  private CreateFileWriter() {
    if (this.in_stream_) { this.in_stream_.end(); }
    this.in_stream_ = new PassThrough();

    this.count_ = 0;
    const timestamp = Date.now();
    const filename = this.GenerateFilename(timestamp);
    ffmpeg(this.in_stream_)
      .inputFPS(this.fps_)
      .outputOptions("-c:v libx264")
      .outputOptions("-pix_fmt yuv420p")
      .outputOptions("-f mp4")
      .outputOptions("-movflags frag_keyframe+empty_moov")
      .pipe(fs.createWriteStream(path.join(this.config_.save_dir, filename)), { end: true })
      .on("error", (error) => {
        console.log(error);
      });

    this.index_.videos.push({
      file_loc: path.join(this.config_.save_dir, filename),
      date: timestamp,
      expires: timestamp + this.config_.delete_after
    });
    try {
      fs.writeFileSync(this.index_loc_, JSON.stringify(this.index_));
    } catch (error) {
      console.warn(error);
    }
  }

  private DeleteExpired() {
    for (let i = this.index_.videos.length - 1; i >= 0; i--) {
      if (this.index_.videos[i].expires <= Date.now() - 60 * 1000) {
        const file_loc = this.index_.videos[i].file_loc;
        this.index_.videos.splice(i, 1);

        fs.unlink(file_loc, (err) => {
          if (err) {
            console.warn(err);
            this.to_delete_.push(file_loc);
          }
          else {
            console.log(`Deleted expired file: ${file_loc}`);
          }
        });
      }
    }
    fs.writeFile(this.index_loc_, JSON.stringify(this.index_), (err) => { if (err) console.warn(err); });


    for (let i = this.to_delete_.length - 1; i >= 0; i--) {
      const file_loc = this.to_delete_[i];
      this.to_delete_.splice(i, 1);

      fs.unlink(file_loc, (err) => {
        if (err) {
          console.warn(err);
          this.to_delete_.push(file_loc);
        }
        else {
          console.log(`Deleted expired file: ${file_loc}`);
        }
      });
    }
  }

  private ReadIndex() {
    try {
      const data = fs.readFileSync(this.index_loc_).toString();
      this.index_ = JSON.parse(data);
    }
    catch (error) {
      console.warn(error);
      this.index_ = { videos: [] };
      try {
        fs.writeFileSync(this.index_loc_, JSON.stringify(this.index_));
      } catch (error) {
        console.warn(error);
      }
    }
  }
}