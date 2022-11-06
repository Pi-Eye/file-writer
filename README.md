# File Writer

## About

File writer for Pi-Eye

### Built With

* NodeJS
* TypeScript
* fluent-ffmpeg

## Getting Started

### Prerequisites

1. [Node](https://nodejs.org/en/) and npm

### Installation

1. Install NPM package: file-writer
    ```sh
    npm install https://github.com/Pi-Eye/file-writer
    ```

## Usage

### Example File Writer

```js
import { FileWriter } from "file-writer";

const cam_name = "Camera";
const fps = 30;
const file_settings = {
  id: 0,                                    // Unique, static id of filewriter
  frame_rate_scale: 1;                      // Amount to scale frame rate down by
  name_format: "{NAME} {DATE} {TIME}";      // Name format in the form a string where "{NAME}", "{DATE}", "{TIME}" denote where to insert camera name, date, and time respectively
  delete_after: 60000;                      // Time after creation to delete a file in ms
  save_dir: "/dir";                         // Path to directory to save to
  vid_length: 60000,                        // Length of a video in ms
  on_motion: false                          // Create file on motion or continuously
}

const writer = new FileWriter(cam_name, fps, file_settings)

const frame;        // some jpg buffer

writer.WriteFrame(frame);

writer.MotionStart();       // Trigger motion start and stop for if on_motion is true
writer.MotionStop();
```

## License

Distributed uner the GPL-3.0 License. See `LICENSE.txt` for more information.

## Contact

Bennett Wu - bwu1324@gmail.com