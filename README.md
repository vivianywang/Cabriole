# Cabriole

Cabriole is a React Native mobile marketplace app that allows artistic athletes to buy and sell their sports items such as costumes, shoes, dancewear, and accessories.


## Features

- User authentication: Users can create an account or log in securely using their email and password via Firebase authentification
- Create listings: Users can post items for sale by uploading up to 5 photos and including item information such as name, price, category, size, etc.
- Browse the marketplace: Scrollable view for users to discover what other's have for sale 
- Searching: Can search for key words to find specific item posted.
- Filtering: Can filter posts by category, price, date posted, etc.
- Item detail: Users can view item details such as user contact information, price, size, description, etc. by clicking on the post in the feed
- Profile page: Users can view the profile of the user posting items and can view their number of listings, number of reports, and more.
- Reporting feature: Users can report profiles if their experience was not satisfactory. Reports are limited to one per user to prevent spamming.
- Chat UI: Chat UI implemented to show what the chat feature would resemble in the future


## Installation

To run Cabriole, you'll first need to install [Node.js](https://nodejs.org) (v18 or higher). npm (Node Package Manager) comes bundled with it automatically

Verify both are installed by running: 

```
node -v
npm -v
```

Both commands should print a version number. From your terminal, navigate to the project folder and run: 

```
npm install
```

This automatically reads `package-json` which incudes all packages needed (view needed packages in `requirements.txt`). 

To start the app, you must have the Expo Go app installed on your phone. From there, run:

```
npx expo start
```

Scan the QR code with your phone, and the app will open. 


## Known Bugs

- Images disappear after reloading the app: When a user posts a listing, the images uploaded will be displayed correctly at that moment. However, after exiting or restarting the app, the images will no longer appear. This is because image storage through Firebase requires a paid plan. 
- Chat feature is not functional: At the moment, our chat feature is only there to deomnstrate what the chat would look like and is only the UI. Users cannot actually chat with others with this feature. In the future, with more time, our team might have the chance to fully implement the backend of the chat feature.


## Sources

### Sites / Videos Accessed for Learning Concepts
 
### Sites / Videos Accessed for Learning Concepts
 
| Site / Video | Purpose |
|--------|---------|
| [https://www.codecademy.com/enrolled/courses/introduction-to-javascript](https://www.codecademy.com/enrolled/courses/introduction-to-javascript) | To learn basic Javascript concepts |
| [https://www.codecademy.com/enrolled/courses/react-101](https://www.codecademy.com/enrolled/courses/react-101) | To learn different React components, and how the library works |
| [https://www.youtube.com/watch?v=J2j1yk-34OY](https://www.youtube.com/watch?v=J2j1yk-34OY) | To learn how to set up our project on React Native and Expo. |
| [https://stackoverflow.com/beta/discussions/78385666/for-a-beginner-developer-whats-the-best-framework-to-use-with-firebase](https://stackoverflow.com/beta/discussions/78385666/for-a-beginner-developer-whats-the-best-framework-to-use-with-firebase) | To decide what backend tool to use for our app (decided on Firebase as we deemed this to be the simplest for our case) |
| [https://reactnative.dev/docs/modal](https://reactnative.dev/docs/modal) | To learn how to code modals and pop ups to inform users about specific cases (ex. empty inputs) |
| [https://reactnativeelements.com/docs/1.2.0/searchbar](https://reactnativeelements.com/docs/1.2.0/searchbar) | To learn how to create a search bar to filter specific elements |
| [https://getstream.io/chat/sdk/react-native/tutorial/cli/](https://getstream.io/chat/sdk/react-native/tutorial/cli/) | To learn how to use Stream's React Native SDK to add chat capabilities to our application |
 
### Code Used from Sites / Videos
 
| Site / Video | Code used / why |
|--------|----------------|
| [https://firebase.google.com/docs/web/setup](https://firebase.google.com/docs/web/setup) | Took the code and followed the instructions from here to set up the backend Firebase environment |
 
### Code from Generative AI
 
| Generative AI Tool | Prompt, how code was used |
|------|--------------------------|
| Claude.ai | Prompt: steps to set up a login screen on react native. Used as a reference (followed the steps given) to code the login screen and the backend components of the screen. Tweaked the front end afterwards as well. |
| ChatGPT | Prompt: Create a pseudocode for an image upload function, including frontend and backend features. Used as a skeleton (replaced blanks with code) to allow programs to access the user's library, and upload to post. |
| Claude.ai | Prompt: steps to allow users to post with different fields of input using React native and Firebase backend. Used as a reference (followed the steps given) to code the posting feature of our app. Tweaked the front end and UI afterwards. Follow up prompt: how to filter these posts based on certain elements. Followed the steps once again to code the filter logic. |
| Claude.ai | Prompt: Why isn't my search bar filtering the content? It doesn't do anything. Used to debug the search/filter functionality on the Feed screen. |
| ChatGPT | Prompt: I implemented a report button, however now the entire user profile screen is not working (it is just showing a black screen). What is going on? Used ChatGPT's response to fix the bug in the code. |
 
