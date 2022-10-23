export type FileWriterConfig = {
    id: number;
    frame_rate_scale: number;
    name_format: string;
    delete_after: number;
    save_dir: string;
    vid_length: number;
    on_motion: boolean;
};
export type VidIndex = {
    videos: Array<{
        file_loc: string;
        date: number;
        expires: number;
    }>;
};
