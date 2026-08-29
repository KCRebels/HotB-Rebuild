# HotB Owner & Recovery Guide

Updated: August 29, 2026

This guide explains where HotB is stored, how its data is protected, and what to do if the phone, website, Firebase account, GitHub repository, or ChatGPT conversation becomes unavailable. It intentionally contains no passwords.

## The three parts of HotB

1. **App code:** GitHub repository `KCRebels/HotB-Rebuild`.
2. **Live website:** GitHub Pages, published from the repository's `main` branch.
3. **Team data:** Saved on the primary iPhone and backed up to Firebase project `HotB KC Rebels` under `hotbkcrebels@gmail.com`.

The ChatGPT conversation is not the permanent copy of the app. GitHub and Firebase are the permanent systems.

## Normal backup behavior

- HotB saves changes on the current device first.
- After the first successful cloud backup, HotB automatically sends later saved changes to Firebase while signed in and online.
- The Cloud Backup screen shows the most recent cloud-backup time.
- **Back Up Now** can be used before a major app update, before changing phones, or whenever confirmation is wanted.
- A restore never happens automatically. HotB asks before replacing device data.

## Before any major app update

1. Open HotB and choose **Cloud Backup**.
2. Confirm the correct email is signed in.
3. Tap **Back Up Now** and wait for completion.
4. Do not publish from an old or unverified copy of the repository.
5. Keep a known working GitHub commit available for rollback.

## If the primary phone is lost or replaced

1. Open the official HotB website on the replacement device.
2. Add it to the Home Screen if desired.
3. Open **Cloud Backup** and sign in with `hotbkcrebels@gmail.com` and the separate HotB backup password.
4. Choose **Restore From Cloud** only after confirming the cloud-backup date.
5. Verify the roster, saved games, reports, measurements, pitchers, teams, coach directory and player information.

## If cloud backup stops

1. Keep using the same device; local data remains on it.
2. Do not delete the Home Screen app or clear Safari website data.
3. Confirm internet access and that HotB is still signed in.
4. Open **Cloud Backup** and try **Back Up Now**.
5. If it fails, record the exact message and check Firebase Authentication, Firestore Rules and the authorized domain.

## If a bad app update is published

1. Do not clear browser data or reinstall the Home Screen app.
2. Identify the last known working GitHub commit.
3. Restore that code version through GitHub.
4. Confirm HotB opens and the device data is still present.
5. Do not use cloud restore unless local data is actually missing or damaged.

## If a ChatGPT conversation ends

Start a new conversation and provide:

- Repository: `KCRebels/HotB-Rebuild`
- Firebase project: `HotB KC Rebels` (`hotb-kc-rebels`)
- Backup account: `hotbkcrebels@gmail.com`
- Primary data location: the HotB Home Screen app on the iPhone
- This file: `HOTB_RECOVERY_GUIDE.md`
- The exact feature or problem being worked on

Ask the new conversation to inspect the current `main` branch before making changes. Never reconstruct HotB from memory when the GitHub repository is available.

## Account protection

- Keep the GitHub and dedicated Gmail recovery email and phone number current.
- Enable two-step verification on the dedicated Gmail account.
- Store passwords in a password manager; do not put passwords in this guide or in the source code.
- Make sure Dan retains owner access to both GitHub and Firebase.

## Things not to do

- Do not delete the Home Screen app or clear Safari website data before confirming a current cloud backup.
- Do not press **Restore From Cloud** merely to check whether it works on the primary phone.
- Do not publish code from a stale local copy.
- Do not assume a successful code update means the data backup also succeeded.
- Do not use two devices for active editing until multi-device conflict protection is added.

## Current limitations

- Firebase keeps the latest backup plus up to 30 daily historical copies.
- HotB visibly reports the last successful backup, warns when a backup needs attention, and retries a pending backup after the device reconnects.
- Full restore has not yet been tested on a second device.
- The live website is publicly reachable; player-information exposure still needs a privacy audit.

These limitations are the next planned protection work.
