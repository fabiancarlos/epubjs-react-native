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

      ::selection{
        background-color: #999db3;
        fill: blue;
        color: #000000;
      }

      .epubjs-ul line {
        stroke: #aaa;
        fill: #aaa;
        stroke-width: 1;
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
      var timeoutSelection;
      var previousMarks = [];
      var globalSelection;

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

      // Get position of selected text
      // https://github.com/johnfactotum/epubjs-tips/blob/master/README.md#get-position-of-selected-text
      const getRect = (target, frame) => {
        const rect = target.getBoundingClientRect()
        const viewElementRect =
            frame ? frame.getBoundingClientRect() : { left: 0, top: 0 }
        const left = rect.left + viewElementRect.left
        const right = rect.right + viewElementRect.left
        const top = rect.top + viewElementRect.top
        const bottom = rect.bottom + viewElementRect.top
        return { left, right, top, bottom }
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

        rendition.on("touchstart", function (event) {

        });

        rendition.on("touchend", function (event) {
          // clearTimeout(timeoutSelection);

          // if (globalSelection) {
          //   timeoutSelection = setTimeout(() => globalSelection.removeAllRanges(), 1200);
          // }
        });

        rendition.on("selected", function (cfiRange, contents) {
          clearTimeout(timeoutSelection);
          let thatRendition = rendition;

          previousMarks.push(cfiRange);
          previousMarks.map(mark => rendition.annotations.remove(mark, "underline") );

          timeoutSelection = setTimeout(() => {
            // thatRendition.annotations.add("highlight", cfiRange, {}, null, 'selected', JSON.stringify({"fill": '#222222', "color": '#fff', "fill-opacity": "0.6", "mix-blend-mode": "multiply"}) );

            rendition.annotations.add("underline", cfiRange, {}, (e) => {
              console.log("underline clicked", e.target);
            });
          }, 400);

          // rendition.annotations.add("underline", cfiRange, {}, (e) => {
          //   console.log("underline clicked", e.target);
          // });
          // contents.window.getSelection().removeAllRanges();

          var frame = contents.document.defaultView.frameElement
          var selection = contents.window.getSelection();
          globalSelection = selection;
          var selectedRange = selection.getRangeAt(0);
          var coords = getRect(selectedRange, frame);
          // const { left, right, top, bottom } = coords;

          book.getRange(cfiRange).then(function (range) {
            // var coords = getRect(range, frame);

            if (range) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onSelected',
                cfiRange: cfiRange,
                text: range.toString(),
                selectedCoords: coords
              }));
            }

            // clearTimeout(timeoutSelection);
            // timeoutSelection = setTimeout(() => selection.removeAllRanges(), 900);
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
