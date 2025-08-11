import React from 'react';
import styled from 'styled-components';

export default function Checkbox( { id, label, checked, onChange } ) {
  return (
    <StyledWrapper>
      <label className="container">
        <input type="checkbox" id={id} checked={checked} onChange={onChange} />
        <div className="checkmark" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Hide the default checkbox */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .container {
    display: block;
    position: relative;
    cursor: pointer;
    font-size: 1rem;
    user-select: none;
  }

  /* Create a custom checkbox */
  .checkmark {
    --clr: var(--IconDark);
    position: relative;
    top: 0;
    left: 0;
    height: 1.3em;
    width: 1.3em;
    background-color: #ccc;
    border-radius: 50%;
    transition: 300ms;
  }

  /* When the checkbox is checked, add a blue background */
  .container input:checked ~ .checkmark {
    background-color: var(--clr);
    border-radius: .5rem;
    animation: pulse 500ms ease-in-out;
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .container input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .container .checkmark:after {
    left: 0.45em;
    top: 0.25em;
    width: 0.25em;
    height: 0.5em;
    border: solid #E0E0E2;
    border-width: 0 0.15em 0.15em 0;
    transform: rotate(45deg);
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 var(--IconColor);
      rotate: 20deg;
    }

    50% {
      rotate: -20deg;
    }

    75% {
      box-shadow: 0 0 0 5px var(--IconLight);
    }

    100% {
      box-shadow: 0 0 0 5px var(--IconLight);
      rotate: 0;
  }`;
