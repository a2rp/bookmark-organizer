![Project screenshot](./screenshot.png)

# Bookmark Organizer

Bookmark Organizer keeps useful web pages in a searchable personal library. Add a short note, place each link in a collection, and mark favorites for quick return.

## Interface

The interface includes a collection rail, a searchable card library, a saved-link summary, and a compact add form. Each card shows its collection, domain, note, and favorite state.

## Features and use

Add a link with a title, web address, collection, and note. Search across the title, address, note, and collection, then filter by collection or Favorites. Mark and unmark favorites, copy an address, open a link in a new tab, and remove a bookmark through a confirmation dialog. Export the current library as a JSON file.

## Data and limits

Bookmarks are saved in localStorage in the current browser profile. The initial library contains examples. Export a JSON copy before clearing browser data. There is no account, cloud sync, or cross-device sharing.

## Run locally

Use Node.js 20.19 or newer and npm, then run these commands from the project folder:

```sh
npm install
npm run dev
```

The app is built with React and Vite. Check the source and production build with:

```sh
npm run lint
npm run build
```

## Deployment

The public app is published with GitHub Pages at [https://a2rp.github.io/bookmark-organizer/](https://a2rp.github.io/bookmark-organizer/). To build and publish the current version, run:

```sh
npm run deploy
```

## Future improvements

Ideas that are not implemented yet:

- A JSON import flow, browser bookmark-file import, and optional cloud sync.

## Links

- Portfolio: [https://www.ashishranjan.net](https://www.ashishranjan.net)
- GitHub: [https://github.com/a2rp](https://github.com/a2rp)
- CodePen: [https://codepen.io/ash1198](https://codepen.io/ash1198)
- LinkedIn: [https://www.linkedin.com/in/aashishranjan](https://www.linkedin.com/in/aashishranjan)
- Facebook: [https://www.facebook.com/theash.ashish/](https://www.facebook.com/theash.ashish/)
- YouTube: [https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1](https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1)
- Email: [mailto:ash.ranjan09@gmail.com](mailto:ash.ranjan09@gmail.com)

## Support

- Support: [https://a2rp-donation-page.netlify.app/](https://a2rp-donation-page.netlify.app/)
- Buy Me a Coffee: [https://buymeacoffee.com/ashishranjan](https://buymeacoffee.com/ashishranjan)
- Patreon: [https://www.patreon.com/ashishranjan](https://www.patreon.com/ashishranjan)
