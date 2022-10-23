/// <reference types="node" />
import { FileWriterConfig, VidIndex } from "./types";
export default class FileWriter {
    private index_loc_;
    private count_;
    private fps_;
    private cam_name_;
    private config_;
    private in_stream_;
    private index_;
    private to_delete_;
    constructor(cam_name: string, fps: number, config: FileWriterConfig);
    GetIndex(): VidIndex;
    MotionStart(back_queue: Array<Buffer>): void;
    MotionStop(): void;
    WriteFrame(frame: Buffer): void;
    private GenerateFilename;
    private CreateFileWriter;
    private DeleteExpired;
    private ReadIndex;
}
