# OCR workbench

OCR Workbench is an environment for OCRing documents and producing a trascription, either in Markdown or HTML format. 

It was inspired by this [HackerNews post](https://news.ycombinator.com/item?id=43048698&utm_source=hackernewsletter&utm_medium=email&utm_term=ask_hn), and my own difficulties using off-the-shelf OCR to transcribe Colonial American documents, which have some unique challenges. 

OCR workbench uses AI-based OCR, in particular it is connected to Gemini, or a switchable fallback that uses Tesseract. Note that Tesseract is free, but performs poorly on these kinds of documents. 

Gemini (and Claude, in the few experiments I did) performs notably better. Note that both Gemini and Claude require API keys, which are not included in this repo, you'll have to get your own. As of this moment the Gemini API key seems to be free, but that may not last and YMMV. 

OCR Workbench is an Ionic/Angular client.

For the curious, it was largely "vibe-coded" with Claude.ai. I asked for an Ionic app with the desired features, and then refined/added features using Cursor / Claude. I have done some hand-styling, and feature tweaks, but probably 80% of the project is AI generated, as is the (rather crude) icon. :)

![screenshot](images/Screenshot.png)

## Basic workflow

1. Download a PDF you wish to transcribe (the repo includes some samples in the ```tests``` directory.)
2. Split the PDFs into one page per file.
3. Create a project, and select the directory where the image files are. Then go page-by-page.
4. On each page, 'extract text' will run your selected OCR engine on the page. Save the text if you want to keep it. 


## To get images from PDFs (e.g. from archive.org)

Download the pdf, then, 

```magick -density 300 yourfile.pdf -quality 85 output-%03d.jpg```

Choose the quality parameters that suit you. All the pages will be loaded into browser memory, so lots of pages that are very large images will drag you down :)

I have found that quality=85 is more than sufficient for OCRing even grainy images.

## Features

- Once OCR'd, the text for a given page will be placed in a Markdown editor gui, where it can be further tweaked. If you want to keep your changes, hit 'Save'. (I used [EasyMDE](https://github.com/Ionaru/easy-markdown-editor), which is very nice.)
- At the project level, you can define substitutions:  the interface calls them *replacements*. Very helpful if you want to globally fix a common spelling error, or "markdown-ize" frequently italized words which the OCR does not detect.
  - Replacements can be a regex, though I have not tested this extensively.
* Adjustable viewing panel: the Image is placed side-by-side with the OCR'd text, for comparison and editing. There is a vertical slider to adjust the relative sizes of the two documents.
* Export: You can export your project to markdown or html, and you can choose one file per page, or one global file. 
* Prompts: If you are using an AI-driven OCR, you can alter the default prompt if you like. 
* OCR engine selection: can be made from the Settings tab.

Note that Tesseract is free, but frequently does not work well on old (e.g. 18th century documents, or Archive.org page scans). You can control which OCR engine is used on the Settings tab.

## API KEYS
 OCR Workbench reads API keys (for example, your Gemini API key) from the environment file (src/environments/environment.ts).
 
 After you have a local install of this repo, do the following:
 
 ```
 cp .env.example .env
 ```
 
 Then edit .env to add your keys. Then run this command:

 ```
 bash installkeys.bash
 ```

 This will insert the keys in the .env file into the environment file. 
 
 `.gitignore` ignores the .env file, so that file will not be uploaded should you commit to git, to avoid publishing your API keys to git. 


## Gemini Quirks

On some older documents, Gemini may issue a "RECITATION" error, indicating it thinks the data is part of its training materials, or under copyright. It can do this in error, as with our test data. There is an issue filed about it somewhere :)

## Data Storage

The app implements two different storage strategies: the data may be stored in the Browser using [RxDB](https://rxdb.info/), or (hypothetically) in the cloud via Firebase. Claude generated the Firebase storage implementation but it is completely untested (and would require an authentication setup as well)

## Install

1. Ensure you have ionic installed.
2. Clone the repo.
3. `ionic serve`

I hope to set up a running demo server at some point.

## Test data

The repo includes a copy of the US Constitution, and the [Trial of John Rackham[(https://discovery.nationalarchives.gov.uk/details/r/C14075679)] (the notorious pirate popularized in the TV series *Black Sails*. Both documents are in the public domain.)

## Todos (in no particular order):

Implement de-hyphenization for words split across lines, with option to put combined word at end of first line or beginning of second line.

implement Claude-based OCR. 

allow selection of a region for OCR (for images with more than one column, e.g. )

ability to insert forced page breaks, and / or not manually include page breaks in the markdown merged output

ability to make special commands into the editor, e.g. a Center command that inserts 
::::: {.centered}
::::: 
around a region

Implement Firebase.


## License

MIT License. Have at it. PR's welcome.


