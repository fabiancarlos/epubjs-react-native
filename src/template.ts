export default `
<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EPUB.js</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>

    <style type="text/css">
      body {
        margin: 0;
      }

      #viewer {
        height: 100vh;
        width: 100vw;
        overflow: hidden !important;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>

  <body oncopy='return false' oncut='return false'>
    <div id="viewer"></div>

    <script>
      var book;

      if (window.BOOK_BASE64) {
        book = ePub(window.BOOK_BASE64, { encoding: "base64" });
      } else if (window.BOOK_URI) {
        book = ePub(window.BOOK_URI);
      }

      var rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
      });

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "onStarted" }));

      // rendition.themes.register({ myTheme: window.THEME });
      // rendition.themes.select('myTheme');

      function getSelectionCoords() {
        var sel = document.selection, range, rect;
        var x = 0, y = 0;
        if (sel) {
            if (sel.type != "Control") {
                range = sel.createRange();
                range.collapse(true);
                x = range.boundingLeft;
                y = range.boundingTop;
            }
        } else if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (range.getClientRects) {
                    range.collapse(true);
                    if (range.getClientRects().length>0){
                        rect = range.getClientRects()[0];
                        x = rect.left;
                        y = rect.top;
                    }
                }
                // Fall back to inserting a temporary element
                if (x == 0 && y == 0) {
                    var span = document.createElement("span");
                    if (span.getClientRects) {
                        // Ensure span has dimensions and position by
                        // adding a zero-width space character
                        span.appendChild( document.createTextNode("\u200b") );
                        range.insertNode(span);
                        rect = span.getClientRects()[0];
                        x = rect.left;
                        y = rect.top;
                        var spanParent = span.parentNode;
                        spanParent.removeChild(span);

                        // Glue any broken text nodes back together
                        spanParent.normalize();
                    }
                }
            }
        }
        return { x: x, y: y };
      }

      book.ready
        .then(function () {
          if (window.LOCATIONS) {
            // alert(window.LOCATIONS);
            return book.locations.load(window.LOCATIONS);
          }
          return book.locations.generate(1600);
        })
        .then(function () {
          var displayed = rendition.display();

          displayed.then(function () {
            var viewer = document.getElementById("viewer");

            var currentLocation = rendition.currentLocation();

            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "onReady",
              totalLocations: book.locations.total,
              currentLocation: currentLocation,
              progress: book.locations.percentageFromCfi(currentLocation.start.cfi),
              pageList: book.pageList,
            }));
          });

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "onLocationsReady",
            epubKey: book.key(),
            locations: book.locations.save(),
          }));

          book.loaded.navigation.then(function (toc) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'onNavigationLoaded',
              toc: toc,
            }));
          });


          // Select fontSize
          // rendition.themes.fontSize("140%");

          // Change font family
          // rendition.themes.font("serif");

          // Register themes
          // Default theme
          /* rendition.themes.default({
              h2: {
                'font-size': '32px',
                color: 'purple'
              },
              p: {
                "margin": '10px'
              }
            });
          */
          // rendition.themes.register("dark", "themes.css");
          // themes.register("light", "http://example.com/light.css");
          // themes.register("light", { "body": { "color": "purple"}});
          // themes.register({ "light" : {...}, "dark" : {...}});

          // Select theme
          // rendition.themes.select('my_theme');

          // Update theme
          // rendition.themes.update("my_theme", { "body": { "color": "purple"}});

          // Override theme
          // rendition.themes.override("my_theme", { "body": { "color": "purple"}});

          // Display a current section
          // rendition.display(currentSection_loc or chapter_href or cfiRange);

          // Annotations

          // Add an annotation
          // rendition.annotations.add(cfiRange, {}, (e) => {
          //   console.log("annotation clicked", e.target);
          // });
          // Remove an annotation
          // rendition.annotations.remove(cfiRange);
        })
        .catch(function (err) {
          alert(err);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "onDisplayError",
            reason: reason
          }));
        });

        rendition.on('started', () => {
          rendition.themes.register({ theme: window.THEME });
		      rendition.themes.select('theme');
        });

        rendition.on("relocated", function (location) {
          var percent = book.locations.percentageFromCfi(location.start.cfi);
          var percentage = Math.floor(percent * 100);

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "onLocationChange",
            totalLocations: book.locations.total,
            currentLocation: location,
            progress: percentage,
          }));

          if (location.atStart) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "onBeginning",
            }));
          }

          if (location.atEnd) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "onFinish",
            }));
          }
        });

        rendition.on("orientationchange", function (orientation) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'onOrientationChange',
            orientation: orientation
          }));
        });

        rendition.on("rendered", function (section) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'onRendered',
            section: section,
            currentSection: book.navigation.get(section.href),
          }));
        });

        rendition.on("layout", function (layout) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'onLayout',
            layout: layout,
          }));
        });

        rendition.on("selected", function (cfiRange, contents) {
          rendition.annotations.add("underline", cfiRange, {}, (e) => {
            console.log("underline clicked", e.target);
          });
          // contents.window.getSelection().removeAllRanges();

          let selection = contents.window.getSelection();
          let oRange = selection.getRangeAt(0); //get the text range
          let oRect = oRange.getBoundingClientRect();

          console.log("oRange >>>", oRange);
          console.log("oRect >>>", oRect);

          // Get Selection
          // sel = contents.window.getSelection()();
          // if (sel.rangeCount && sel.getRangeAt) {
          //   range = sel.getRangeAt(0);
          // }
          // // Set design mode to on
          // contents.document.designMode = "on";
          // if (range) {
          //   sel.removeAllRanges();
          //   sel.addRange(range);
          // }
          // // Colorize text
          // contents.document.execCommand("ForeColor", false, "red");
          // // Set design mode to off
          // contents.document.designMode = "off";

          console.log(">>>> EPUBJS <<<<< getSelectionCoords === ", getSelectionCoords());

          let coords = getSelectionCoords();

          book.getRange(cfiRange).then(function (range) {
            if (range) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onSelected',
                cfiRange: cfiRange,
                text: range.toString(),
                coords: oRect
              }));
            }
          });
        });

        rendition.on("markClicked", function (cfiRange, contents) {
          rendition.annotations.remove(cfiRange, "highlight");
          book.getRange(cfiRange).then(function (range) {
            if (range) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onMarkPressed',
                cfiRange: cfiRange,
                text: range.toString(),
              }));
            }
          });
        });

        rendition.on("resized", function (layout) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'onResized',
            layout: layout,
          }));
        });
    </script>
  </body>
</html>
`;
