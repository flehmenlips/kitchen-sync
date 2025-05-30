import React, { useState } from 'react';

function SignupForm(props: any) {
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eulaAccepted) {
      setFormError('You must agree to the End User License Agreement (EULA) to create an account.');
      return;
    }
    // ... existing submit logic ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... existing form fields ... */}
      <div style={{ margin: '1em 0' }}>
        <label>
          <input
            type="checkbox"
            checked={eulaAccepted}
            onChange={e => setEulaAccepted(e.target.checked)}
            required
          />
          {' '}I have read and agree to the{' '}
          <a href="/eula" target="_blank" rel="noopener noreferrer">End User License Agreement (EULA)</a>
        </label>
      </div>
      {formError && <div style={{ color: 'red', marginBottom: '1em' }}>{formError}</div>}
      {/* ... existing submit button ... */}
    </form>
  );
}

export default SignupForm; 