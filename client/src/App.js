import React, {Component} from 'react';
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom'
import './App.css';
import AuthPage from './pages/Auth';
import BookingPage from './pages/Bookings';
import EventPage from './pages/Events';
import MainNavigation from './components/Navigation'

function App() {
  return (
    <BrowserRouter>
      <MainNavigation />
      <main>
        <Switch>
          <Redirect from="/" to="/auth" exact />
          <Route path="/auth" component={AuthPage} />
          <Route path="/events" component={EventPage} />
          <Route path="/bookings" component={BookingPage} />
          <Redirect from="**" to="/auth" />
        </Switch>
       </main>
    </BrowserRouter>
  );
}

export default App;
