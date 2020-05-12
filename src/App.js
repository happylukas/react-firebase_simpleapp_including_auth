import React, { useState, useEffect } from 'react';
import './App.css';
import firebase, { auth, provider } from './firebase.js';

function App() {
  const [currentItem, setCurrentItem] = useState('');
  const [username, setUsername] = useState('');
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const itemsRef = firebase.database().ref('items');
    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user
        });
      }
      setItems(newState);
    });
    //Persisting Login Across Refresh
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    })
  }, [])

  const handleCurrentItem = (e) => {
    setCurrentItem(e.target.value);
  }

  const handleUsername = (e) => {
    setUsername(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemsRef = firebase.database().ref('items');
    const item = {
      title: currentItem,
      user: user.displayName || user.email
    }
    console.log(user.displayName);
    itemsRef.push(item);
    setUsername('');
    setCurrentItem('');
  }

  const removeItem = (itemId) => {
    const itemRef = firebase.database().ref(`/items/${itemId}`);
    itemRef.remove();
  }

  const login = () => {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log(user);
        setUser(user);
      })
  }

  const logout = () => {
    auth.signOut()
      .then(() => {
        setUser(null);
      })
  }

  return (
    <div className="App">
      <header>
        <div className="wrapper">
          <h1>Fun Food Friends</h1>
          {user ? <button onClick={logout}>Log Out</button> : <button onClick={login}>Log In</button>}
        </div>
      </header>
      {user ?
        <div>
          <div className="user-profile">
            <img src={user.photoURL} />
          </div>
          <div className="container">
            <section className="add-item">
              <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="What is your name?" value={username} onChange={handleUsername} />
                <input type="text" name="currentItem" placeholder="What are you bringing" value={currentItem} onChange={handleCurrentItem} />
                <button>Add Item</button>
              </form>
            </section>
            <section>
              <div className="wrapper">
                <ul>
                  {
                    items.map((item) => {
                      return (
                        <li key={item.id}>
                          <h3>{item.title}</h3>
                          <p>brought by: {item.user}
                            {item.user === user.displayName || item.user === user.email ?
                              <button onClick={() => removeItem(item.id)}>Remove Item</button> : null
                            }
                          </p>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
            </section>
          </div>
        </div>
        :
        <div className="wrapper">
          <p>you must be logged in to see the potluck list and submit to it.</p>
        </div>
      }

    </div>
  );
}

export default App;
