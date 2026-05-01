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
 
| Source | Purpose |
|--------|---------|
| [Codecademy – Introduction to JavaScript](https://www.codecademy.com/enrolled/courses/introduction-to-javascript) | Used to learn foundational JavaScript concepts applied throughout the app. |
| [Codecademy – React 101](https://www.codecademy.com/enrolled/courses/react-101) | Used to learn React components, state, props, and how the React library works — the basis of the entire app's UI. |
| [YouTube – React Native & Expo Setup](https://www.youtube.com/watch?v=J2j1yk-34OY) | Followed to set up the initial project structure using React Native and Expo. |
| [Stack Overflow – Firebase for Beginners](https://stackoverflow.com/beta/discussions/78385666/for-a-beginner-developer-whats-the-best-framework-to-use-with-firebase) | Consulted when deciding which backend tool to use; led to choosing Firebase as the most approachable option for this project. |
| [React Native Docs – Modal](https://reactnative.dev/docs/modal) | Used to learn how to build modals and pop-up alerts, such as empty input warnings and logout confirmations. |
| [React Native Elements – SearchBar](https://reactnativeelements.com/docs/1.2.0/searchbar) | Used to learn how to implement a search bar for filtering listings on the Feed screen. |
| [Stream – React Native Chat SDK](https://getstream.io/chat/sdk/react-native/tutorial/cli/) | Referenced when exploring how to add chat capabilities to the app. |
 
### Code Used from Sites / Videos
 
| Source | How It Was Used |
|--------|----------------|
| [Firebase Web Setup Docs](https://firebase.google.com/docs/web/setup) | Followed the setup instructions and used the provided configuration code to initialize the Firebase backend (`firebase.js`). |
 
### Code from Generative AI
 
| Tool | Prompt & How It Was Used |
|------|--------------------------|
| Claude.ai | **Prompt:** *"Steps to set up a login screen on React Native."* Used as a reference to build `LoginScreen.js` and the authentication backend. The front end was redesigned afterward. |
| ChatGPT | **Prompt:** *"Create a pseudocode for an image upload function, including frontend and backend features."* Used as a structural skeleton for the image upload feature in `PostScreen.js`, replacing placeholders with working code to access the user's photo library. |
| Claude.ai | **Prompt:** *"Steps to allow users to post with different fields of input using React Native and Firebase backend."* Followed to build the posting feature in `PostScreen.js`. UI was customized afterward. **Follow-up prompt:** *"How to filter these posts based on certain elements."* Used to implement the category filter logic on the Feed screen. |
| Claude.ai | **Prompt:** *"Why isn't my search bar filtering the content? It doesn't do anything."* Used to debug the search/filter functionality on the Feed screen. |
| ChatGPT | **Prompt:** *"I implemented a report button, however now the entire user profile screen is not working (it is just showing a black screen). What is going on?"* Used to identify and fix the bug causing `UserProfileScreen.js` to render as a blank screen. |
