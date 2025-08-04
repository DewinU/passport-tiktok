# passport-tiktok

[Passport](http://passportjs.org/) strategy for authenticating with [TikTok](https://www.tiktok.com/) using the OAuth 2.0 API.

This module lets you authenticate using TikTok in your Node.js applications. By plugging into Passport, TikTok authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-tiktok
```

## Usage

#### Configure Strategy

The TikTok authentication strategy authenticates users using a TikTok account and OAuth 2.0 tokens. The strategy requires a `verify` callback, which accepts these credentials and calls `done` providing a user, as well as `options` specifying a client ID, client secret, and callback URL.

```typescript
import passport from 'passport';
import { Strategy as TikTokStrategy } from 'passport-tiktok';

passport.use(new TikTokStrategy({
    clientID: 'your-tiktok-client-id',
    clientSecret: 'your-tiktok-client-secret',
    clientKey: 'your-tiktok-client-key',
    callbackURL: "https://www.example.net/auth/tiktok/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ tiktokId: profile.openId }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'tiktok'` strategy, to authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/) application:

```typescript
app.get('/auth/tiktok',
  passport.authenticate('tiktok'));

app.get('/auth/tiktok/callback', 
  passport.authenticate('tiktok', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## Profile

The profile returned by TikTok contains the following properties:

- `provider` - Always set to `'tiktok'`
- `openId` - The user's TikTok open id
- `displayName` - The user's display name
- `avatarUrl` - The URL of the user's profile picture

**Extended Profile (with `user.info.profile` scope):**
- `username` - The user's TikTok username

**Note:** The `username` field is only included when you request the `user.info.profile` scope and have been granted additional permissions by TikTok. For most authentication use cases, the basic profile with `openId` and `displayName` is sufficient.

## Scopes

The following scopes are available:

- `user.info.basic` - Basic user information (default, available with Login Kit)
- `user.info.profile` - Extended profile information including username (requires additional permissions)
- `user.info.stats` - User statistics (requires additional permissions)
- `video.list` - Access to user's video list (requires additional permissions)

For more scopes see [TikTok Scopes reference](https://developers.tiktok.com/doc/tiktok-api-scopes)

**Usage Examples:**

```typescript
// Basic authentication (Login Kit only)
passport.use(new TikTokStrategy({
    clientID: 'your-tiktok-client-id',
    clientSecret: 'your-tiktok-client-secret',
    clientKey: 'your-tiktok-client-key',
    callbackURL: "https://www.example.net/auth/tiktok/callback"
    // No scope specified - uses default user.info.basic
  },
  function(accessToken, refreshToken, profile: TikTokBasicProfile, done) {
    // profile will be TikTokBasicProfile (no username field)
    User.findOrCreate({ tiktokId: profile.openId, displayName: profile.displayName }, function (err, user) {
      return done(err, user);
    });
  }
));

// Extended authentication (with additional permissions)
passport.use(new TikTokStrategy({
    clientID: 'your-tiktok-client-id',
    clientSecret: 'your-tiktok-client-secret',
    clientKey: 'your-tiktok-client-key',
    callbackURL: "https://www.example.net/auth/tiktok/callback",
    scope: ['user.info.basic', 'user.info.profile']
  },
  function(accessToken, refreshToken, profile: TikTokExtendedProfile, done) {
    // profile will be TikTokExtendedProfile (includes username)
    User.findOrCreate({ tiktokId: profile.openId, username: profile.username }, function (err, user) {
      return done(err, user);
    });
  }
));
```

## Development

This project is written in TypeScript. To build the project:

```bash
npm run build
```