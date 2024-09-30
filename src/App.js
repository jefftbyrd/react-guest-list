import './App.css';
import { useEffect, useState } from 'react';

export function GuestList() {
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const baseUrl = 'https://w75hy3-4000.csb.app';

  // runs on initial render, re-renders when guests state changes
  useEffect(() => {
    async function fetchGuests() {
      const response = await fetch(`${baseUrl}/guests`);
      const allGuests = await response.json();

      setIsLoading(false);
      setGuests(allGuests);
    }
    fetchGuests().catch((error) => {
      console.log(error);
    });
  }, [guests]);

  if (isLoading) {
    // early return
    return 'Loading...';
  }

  return (
    // Form for adding a new guest
    <div>
      <div className="addGuest">
        <h2>Add a new guest</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setFirstNameInput(firstNameInput);
            setLastNameInput(lastNameInput);
          }}
        >
          <label>
            {/* Enter first name */}
            First name:
            <input
              value={firstNameInput}
              onChange={(event) => setFirstNameInput(event.currentTarget.value)}
            />
          </label>
          <label>
            {/* Enter last name */}
            Last name:
            <input
              value={lastNameInput}
              onChange={(event) => setLastNameInput(event.currentTarget.value)}
              onKeyDown={async (event) => {
                if (event.key === 'Enter') {
                  const response = await fetch(`${baseUrl}/guests`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      firstName: firstNameInput,
                      lastName: lastNameInput,
                      attending: false,
                    }),
                  });
                  const createdGuest = await response.json();
                  setGuests([...guests, createdGuest]);
                  setFirstNameInput('');
                  setLastNameInput('');
                }
              }}
            />
          </label>
        </form>
      </div>
      {/* Container for the guest list */}
      <div className="guestList">
        {guests.map((guest) => {
          return (
            <div
              key={`guest-${guest.id}`}
              data-test-id="guest"
              className="guestItem"
            >
              {/* Toggle whether guest is attending or not */}
              <div
                style={{
                  backgroundColor: guest.attending ? 'lightGreen' : 'pink',
                }}
                className="attending"
              >
                <form onSubmit={(event) => event.preventDefault()}>
                  <input
                    type="checkbox"
                    aria-label="attending"
                    checked={guest.attending}
                    onChange={async () => {
                      const response = await fetch(
                        `${baseUrl}/guests/${guest.id}`,
                        {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            attending: !guest.attending,
                          }),
                        },
                      );
                      const updatedGuest = await response.json();
                      const newGuests = [...guests];
                      setGuests(newGuests);
                    }}
                  />
                </form>
                <p>{guest.attending ? 'attending' : 'not attending'}</p>
              </div>
              {/* Display guest name */}
              <h2>
                {guest.firstName} {guest.lastName}
              </h2>
              {/* Click to remove guest */}
              <button
                onClick={async () => {
                  const response = await fetch(
                    `${baseUrl}/guests/${guest.id}`,
                    {
                      method: 'DELETE',
                    },
                  );
                  const deletedGuest = await response.json();
                  const newGuests = [...guests];
                  setGuests(newGuests);
                }}
              >
                Remove guest
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <header>
        <h1>Guest List</h1>
      </header>
      <GuestList />
    </div>
  );
}
