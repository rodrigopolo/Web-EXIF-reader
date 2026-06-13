# Web EXIF reader

A simple, privacy-friendly web-based EXIF metadata viewer for JPG and HEIC/HEIF photos. Everything runs client-side — files are processed entirely in your browser and never uploaded to a server.

[Demo](http://rodrigopolo.github.io/Web-EXIF-reader/)

## Features

- **Drag and drop** image files onto the page, or click the drop zone to browse and select files — multiple files at once are supported.
- Supports **JPG/JPEG and HEIC/HEIF** files.
- Reads EXIF, GPS, and IFD0 metadata via [exifr](https://github.com/MikeKovarik/exifr), and shows a quick summary per image including:
  - Exposure time and aperture (f-number)
  - ISO
  - Focal length, with 35mm-equivalent when available
  - Camera/device model
  - Capture date and time
  - GPS coordinates, with a direct link to view the location on Google Maps
- Shows an embedded **thumbnail preview** for each photo, when one is available.
- Gracefully handles photos with **missing or partial EXIF data**, showing "No EXIF data found" instead of erroring out.
- **Expandable details panel**: click an image's row to slide down a full table of *all* metadata found in the file — a deep parse covering EXIF, GPS, XMP, IPTC, and ICC tags. Click the row again to slide it back up.
  - Large arrays and binary data (e.g. ICC color profile curves) are summarized rather than dumped in full, keeping the table readable.
  - All displayed values are HTML-escaped, so metadata containing special characters renders safely.
- **Keyboard accessible** — the drop zone and each image row can be activated with Enter/Space.
- Clean, **dark-themed** interface.

## Tech

- Vanilla JavaScript, no build step or framework
- [exifr](https://github.com/MikeKovarik/exifr) for EXIF/GPS/XMP/IPTC/ICC parsing, loaded via CDN

-------

### Donations
[PayPal](http://paypal.me/rodrigopolo)

-------

### License

(The MIT License)

Copyright (c) by Rodrigo Polo http://RodrigoPolo.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.