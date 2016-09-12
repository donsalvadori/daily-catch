import React from 'react';
import AddFishForm from './AddFishForm';
import Catalyst from 'react-catalyst';
import autobind from 'autobind-decorator';
import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAxbyLRwDjLLj3bIsVxPyu1-5Z6MuQlajw",
    authDomain: "daily-catch.firebaseapp.com",
    databaseURL: "https://daily-catch.firebaseio.com",
    storageBucket: "daily-catch.appspot.com",
  };

firebase.initializeApp(config);


@autobind
class Inventory extends React.Component{

  constructor(){
    super();

    this.state = {
      uid: ''
    }
  }

  componentWillMount(){
    firebase.auth().onAuthStateChanged( (user) => {
      if (user) {
        // User is signed in.
        this.authHandler(user);
      } else {
        // No user is signed in.
      }
    });
  }

  authenticate(provider){
    firebase.auth().signInWithPopup(provider).then(this.authHandler).catch(err => console.error(err));
  }

  authHandler(authData){
    const storeRef = firebase.database().ref('store/' + this.props.params.storeId);
    storeRef.on('value', (snapshot) => {
      var data = snapshot.val() || {};
      var user = authData.user || authData;
      if (!data.owner){
        //claim store as own
        storeRef.set({
          owner: user.uid
        })
      }
      //update state to reflect the current store owner and logged in user
      this.setState({
        uid: user.uid,
        owner: data.owner || user.uid
      })
    })
  }

  signOut(){
    firebase.auth().signOut().then( () => {
      this.setState({
        uid: null
      })
    }, (error) => {

    });
  }

  //OAuth working need to host now
  renderLogin(){
    return(
      <nav className="login">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's inventory</p>
        <button className="github" onClick={this.authenticate.bind(this, new firebase.auth.GithubAuthProvider() )}>Log In with Github</button>
        <button className="facebook" onClick={this.authenticate.bind(this, new firebase.auth.FacebookAuthProvider() )}>Log In with Facebook</button>
        <button className="twitter" onClick={this.authenticate.bind(this, new firebase.auth.TwitterAuthProvider() )}>Log In with Twitter</button>
      </nav>
    )
  }

  renderInventory(key){
    var linkState = this.props.linkState;
    return(
      <div className="fish-edit" key={key}>
        <input type="text" valueLink={linkState('fishes.' + key + '.name')}/>
        <input type="text" valueLink={linkState('fishes.' + key + '.price')}/>
        <select valueLink={linkState('fishes.' + key + '.status')}>
          <option value="unavailable">Sold Out!</option>
          <option value="available">Fresh!</option>
        </select>

        <textarea valueLink={linkState('fishes.' + key + '.desc')}></textarea>
        <input type="text" valueLink={linkState('fishes.' + key + '.image')}/>
        <button onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>
      </div>
    )
  }

  render(){
    let logoutButton = <button onClick={this.signOut}>Log Out!</button>
    //1st check if they arent logged in 
    if(!this.state.uid){
      return(
        <div>{this.renderLogin()}</div>
      )
    }
    // then check if they arent owner of current store

    if(this.state.uid !== this.state.owner){
      return(
        <div>
          <p>Sorry, you aren't the owner of this store</p>
          {logoutbutton}
        </div>
      )
    }

    return(
      <div>
        <h2>Inventory</h2>
        {logoutbutton}

        {Object.keys(this.props.fishes).map(this.renderInventory)}

        <AddFishForm {...this.props} />
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    )
  }
}

Inventory.propTypes = {
  addFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  fishes: React.PropTypes.object.isRequired,
  linkState: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired
}

export default Inventory;