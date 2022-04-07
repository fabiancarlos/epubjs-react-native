import * as React from 'react';

import { SafeAreaView, useWindowDimensions, View } from 'react-native';
import { Reader, ReaderProvider } from 'epubjs-react-native';

export default function App() {
  return (
    <SafeAreaView>
      <ReaderProvider>
        <Book />
      </ReaderProvider>
    </SafeAreaView>
  );
}

function Book() {
  const { width, height } = useWindowDimensions();
  console.log("DUDE");
  return (
    <View>
      <Reader
        src={{ uri: 'https://s3.amazonaws.com/moby-dick/OPS/package.opf' }}
        width={width}
        height={height}
        onStarted={() => console.log("onStarted")}
        onReady={(totalLocations, currentLocation, progress, pageList) => {
          console.log("onReady", totalLocations, currentLocation, progress, pageList);
        }}
        onSelected={(selectedText, cfiRange, coords) => console.log(selectedText, cfiRange, coords) }
      />
    </View>
  );
}
