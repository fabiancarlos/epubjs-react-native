import React, { createContext, useReducer, useRef } from 'react';
import type WebView from 'react-native-webview';
import type {
  ePubCfi,
  FontSize,
  Location,
  Mark,
  SearchResult,
  Theme,
} from './types';

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

enum Types {
  CHANGE_THEME = 'CHANGE_THEME',
  CHANGE_FONT_SIZE = 'CHANGE_FONT_SIZE',
  CHANGE_FONT_FAMILY = 'CHANGE_FONT_FAMILY',
  SET_AT_START = 'SET_AT_START',
  SET_AT_END = 'SET_AT_END',
  SET_KEY = 'SET_KEY',
  SET_TOTAL_LOCATIONS = 'SET_TOTAL_LOCATIONS',
  SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION',
  SET_PROGRESS = 'SET_PROGRESS',
  SET_LOCATIONS = 'SET_LOCATIONS',
  SET_PAGE_LIST = 'SET_PAGE_LIST',
  SET_COORDS = 'SET_COORDS',
  SET_IS_LOADING = 'SET_IS_LOADING',
  SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS',
}

type BookPayload = {
  [Types.CHANGE_THEME]: Theme;
  [Types.CHANGE_FONT_SIZE]: FontSize;
  [Types.CHANGE_FONT_FAMILY]: string;
  [Types.SET_AT_START]: boolean;
  [Types.SET_AT_END]: boolean;
  [Types.SET_KEY]: string;
  [Types.SET_TOTAL_LOCATIONS]: number;
  [Types.SET_CURRENT_LOCATION]: Location;
  [Types.SET_PROGRESS]: number;
  [Types.SET_LOCATIONS]: ePubCfi[];
  [Types.SET_PAGE_LIST]: string;
  [Types.SET_COORDS]: string;
  [Types.SET_IS_LOADING]: boolean;
  [Types.SET_SEARCH_RESULTS]: SearchResult[];
};

type BookActions = ActionMap<BookPayload>[keyof ActionMap<BookPayload>];

type InitialState = {
  theme: Theme;
  fontFamily: string;
  fontSize: FontSize;
  atStart: boolean;
  atEnd: boolean;
  key: string;
  totalLocations: number;
  currentLocation: Location | null;
  progress: number;
  locations: ePubCfi[];
  pageList: string;
  coords: string;
  isLoading: boolean;
  searchResults: SearchResult[];
};

export const defaultTheme: Theme = {
  'body': {
    background: '#fff',
  },
  'span': {
    color: '#000 !important',
  },
  'p': {
    color: '#000 !important',
  },
  'li': {
    color: '#000 !important',
  },
  'h1': {
    color: '#000 !important',
  },
  'a': {
    'color': '#000 !important',
    'pointer-events': 'auto',
    'cursor': 'pointer',
  },
  '::selection': {
    background: 'lightskyblue',
  },
};

const initialState: InitialState = {
  theme: defaultTheme,
  fontFamily: 'Helvetica',
  fontSize: '12pt',
  atStart: false,
  atEnd: false,
  key: '',
  totalLocations: 0,
  currentLocation: null,
  progress: 0,
  locations: [],
  pageList: '',
  coords: '',
  isLoading: false,
  searchResults: [],
};

function bookReducer(state: InitialState, action: BookActions): InitialState {
  switch (action.type) {
    case Types.CHANGE_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case Types.CHANGE_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload,
      };
    case Types.CHANGE_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.payload,
      };
    case Types.SET_AT_START:
      return {
        ...state,
        atStart: action.payload,
      };
    case Types.SET_AT_END:
      return {
        ...state,
        atEnd: action.payload,
      };
    case Types.SET_KEY:
      return {
        ...state,
        key: action.payload,
      };
    case Types.SET_TOTAL_LOCATIONS:
      return {
        ...state,
        totalLocations: action.payload,
      };
    case Types.SET_CURRENT_LOCATION:
      return {
        ...state,
        currentLocation: action.payload,
      };
    case Types.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
      };
    case Types.SET_LOCATIONS:
      return {
        ...state,
        locations: action.payload,
      };
    case Types.SET_PAGE_LIST:
      return {
        ...state,
        pageList: action.payload,
      };
    case Types.SET_COORDS:
      return {
        ...state,
        coords: action.payload,
      };
    case Types.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case Types.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
      };
    default:
      return state;
  }
}

export interface ReaderContextProps {
  registerBook: (bookRef: WebView) => void;
  setAtStart: (atStart: boolean) => void;
  setAtEnd: (atEnd: boolean) => void;
  setTotalLocations: (totalLocations: number) => void;
  setCurrentLocation: (location: Location) => void;
  setProgress: (progress: number) => void;
  setPageList: (pageList: string) => void;
  setCoords: (coords: string) => void;
  setLocations: (locations: ePubCfi[]) => void;
  setIsLoading: (isLoading: boolean) => void;

  /**
   * Go to specific location in the book
   * @param {ePubCfi} target {@link ePubCfi}
   */
  goToLocation: (cfi: ePubCfi) => void;

  /**
   * Go to previous page in the book
   */
  goPrevious: () => void;

  /**
   * Go to next page in the book
   */
  goNext: () => void;

  /**
   * Get the total locations of the book
   */
  getLocations: () => ePubCfi[];

  /**
   * Returns the current location of the book
   * @returns {Location} {@link Location}
   */
  getCurrentLocation: () => Location | null;

  /**
   * Search for a specific text in the book
   * @param {string} query {@link string} text to search
   */
  search: (query: string) => void;

  /**
   * @param theme {@link Theme}
   * @description Theme object.
   * @example
   * ```
   * selectTheme({ body: { background: '#fff' } });
   * ```
   */
  changeTheme: (theme: Theme) => void;

  /**
   * Change font size of all elements in the book
   * @param font
   * @see https://www.w3schools.com/cssref/css_websafe_fonts.asp
   */
  changeFontFamily: (fontFamily: string) => void;

  /**
   * Change font size of all elements in the book
   * @param {FontSize} size {@link FontSize}
   */
  changeFontSize: (size: FontSize) => void;

  /**
   * Add Mark a specific cfi in the book
   */
  addMark: (
    type: Mark,
    cfiRange: ePubCfi,
    data?: any,
    callback?: () => void,
    className?: string,
    styles?: any
  ) => void;

  /**
   * Remove Mark a specific cfi in the book
   */
  removeMark: (cfiRange: ePubCfi, type: Mark) => void;

  setKey: (key: string) => void;

  /**
   * Works like a unique id for book
   */
  key: string;

  /**
   * A theme object.
   */
  theme: Theme;

  /**
   * Indicates if you are at the beginning of the book
   * @returns {boolean} {@link boolean}
   */
  atStart: boolean;

  /**
   * Indicates if you are at the end of the book
   * @returns {boolean} {@link boolean}
   */
  atEnd: boolean;

  /**
   * The total number of locations
   */
  totalLocations: number;

  /**
   * The current location of the book
   */
  currentLocation: Location | null;

  /**
   * The progress of the book
   * @returns {number} {@link number}
   */
  progress: number;

  locations: ePubCfi[];

  pageList: string;

  coords: string;

  /**
   * Indicates if the book is loading
   * @returns {boolean} {@link boolean}
   */
  isLoading: boolean;

  /**
   * Search results
   * @returns {SearchResult[]} {@link SearchResult[]}
   */
  searchResults: SearchResult[];

  setSearchResults: (results: SearchResult[]) => void;
}

const ReaderContext = createContext<ReaderContextProps>({
  registerBook: () => {},
  setAtStart: () => {},
  setAtEnd: () => {},
  setTotalLocations: () => {},
  setCurrentLocation: () => {},
  setProgress: () => {},
  setPageList: () => {},
  setCoords: () => {},
  setLocations: () => {},
  setIsLoading: () => {},

  goToLocation: () => {},
  goPrevious: () => {},
  goNext: () => {},
  getLocations: () => [],
  getCurrentLocation: () => null,
  search: () => {},

  changeTheme: () => {},
  changeFontFamily: () => {},
  changeFontSize: () => {},

  addMark: () => {},
  removeMark: () => {},

  setKey: () => {},
  key: '',

  theme: defaultTheme,
  atStart: false,
  atEnd: false,
  totalLocations: 0,
  currentLocation: null,
  progress: 0,
  locations: [],
  pageList: '',
  coords: '',
  isLoading: false,

  searchResults: [],
  setSearchResults: () => {},
});

const ReaderProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(bookReducer, initialState);
  const book = useRef<WebView | null>(null);

  function registerBook(bookRef: WebView) {
    book.current = bookRef;
  }

  function changeTheme(theme: Theme) {
    book.current?.injectJavaScript(`
      window.THEME = ${JSON.stringify(theme)};
      window.rendition.themes.register({ theme: window.THEME });
        window.rendition.themes.select('theme');
        window.rendition.views().forEach(view => view.pane ? view.pane.render() : null)
    `);
    dispatch({ type: Types.CHANGE_THEME, payload: theme });
  }

  function changeFontFamily(fontFamily: string) {
    book.current?.injectJavaScript(`
      rendition.themes.font('${fontFamily}');
    `);
    dispatch({ type: Types.CHANGE_FONT_FAMILY, payload: fontFamily });
  }

  function changeFontSize(size: FontSize) {
    book.current?.injectJavaScript(`
      rendition.themes.fontSize('${size}'); true
    `);
    dispatch({ type: Types.CHANGE_FONT_SIZE, payload: size });
  }

  function setAtStart(atStart: boolean) {
    dispatch({ type: Types.SET_AT_START, payload: atStart });
  }

  function setAtEnd(atEnd: boolean) {
    dispatch({ type: Types.SET_AT_END, payload: atEnd });
  }

  function setTotalLocations(totalLocations: number) {
    dispatch({ type: Types.SET_TOTAL_LOCATIONS, payload: totalLocations });
  }

  function setCurrentLocation(location: Location) {
    dispatch({ type: Types.SET_CURRENT_LOCATION, payload: location });
  }

  function setProgress(progress: number) {
    dispatch({ type: Types.SET_PROGRESS, payload: progress });
  }

  function setPageList(pageList: string) {
    dispatch({ type: Types.SET_PAGE_LIST, payload: pageList });
  }

  function setCoords(coords: string) {
    dispatch({ type: Types.SET_COORDS, payload: coords });
  }

  function setLocations(locations: ePubCfi[]) {
    dispatch({ type: Types.SET_LOCATIONS, payload: locations });
  }

  function setIsLoading(isLoading: boolean) {
    dispatch({ type: Types.SET_IS_LOADING, payload: isLoading });
  }

  function goToLocation(target: ePubCfi) {
    book.current?.injectJavaScript(`rendition.display('${target}'); true`);
  }

  function goPrevious() {
    book.current?.injectJavaScript(`rendition.prev(); true`);
  }

  function goNext() {
    book.current?.injectJavaScript(`rendition.next(); true`);
  }

  function getLocations() {
    return state.locations;
  }

  function getCurrentLocation() {
    return state.currentLocation;
  }

  // Works
  function search(query: string) {
    book.current?.injectJavaScript(`
      Promise.all(
        window.book.spine.spineItems.map((item) => {
          return item.load(window.book.load.bind(window.book)).then(() => {
            let results = item.find('${query}'.trim());
            item.unload();
            return Promise.resolve(results);
          });
        })
      ).then((results) =>
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'onSearch', results: [].concat.apply([], results) })
        )
      ); true
    `);
  }

  function setSearchResults(results: SearchResult[]) {
    dispatch({ type: Types.SET_SEARCH_RESULTS, payload: results });
  }

  // Works
  function addMark(
    type: Mark,
    cfiRange: string,
    data?: any,
    callback?: () => void,
    className?: string,
    styles?: any
  ) {
    const defaultStyles = { fill: 'red' };

    book.current?.injectJavaScript(`
      rendition.annotations.add('${type}', '${cfiRange}', ${JSON.stringify(
      data ?? {}
    )}, ${JSON.stringify(
      callback ? callback() : () => {}
    )}, '${className}', ${JSON.stringify(styles ?? defaultStyles)}); true
    `);
  }

  // Works
  function removeMark(cfiRange: string, type: Mark) {
    book.current?.injectJavaScript(`
      rendition.annotations.remove('${cfiRange}', '${type}'); true
    `);
  }

  // Works
  function setKey(key: string) {
    dispatch({ type: Types.SET_KEY, payload: key });
  }
  return (
    <ReaderContext.Provider
      value={{
        registerBook,
        setAtStart,
        setAtEnd,
        setTotalLocations,
        setCurrentLocation,
        setProgress,
        setLocations,
        setPageList,
        setCoords,
        setIsLoading,

        goToLocation,
        goPrevious,
        goNext,
        getLocations,
        getCurrentLocation,
        search,

        addMark,
        removeMark,

        setKey,
        key: state.key,

        changeTheme,
        changeFontFamily,
        changeFontSize,
        theme: state.theme,

        atStart: state.atStart,
        atEnd: state.atEnd,
        totalLocations: state.totalLocations,
        currentLocation: state.currentLocation,
        progress: state.progress,
        locations: state.locations,
        pageList: state.pageList,
        coords: state.coords,
        isLoading: state.isLoading,

        searchResults: state.searchResults,
        setSearchResults,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
};

export { ReaderProvider, ReaderContext };
