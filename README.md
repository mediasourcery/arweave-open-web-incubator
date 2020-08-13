# Cross blockchain document uploader with authorization, sharing, incentivized notification and drag-and-drop

Real usage for applications should span enterprises and multiple blockchains. Expecting or forcing users to utilize one blockchain solution (or even one Enterprise solution) is great for experiments or proof-of-concepts. But it does not reflect the real world. Media Sourcery's products work across systems, attempting to hide the complexities from users who just want to gets tasks done.

This solution is a document uploader integrated with Media Sourcery's Auth Service product that supports Blockstack Connect and uPort authentication, and their respective decentralized storage options plus arweave's permaweb storage. The solution provides sharing, notifications that documents have been shared and indications that the documents have been viewed.

It will support future integrations to the Media Sourcery Workflow As A Service products.

## Features

This document uploader demonstrates the simple act of uploading a document. It provides flexibility for that simple act by facilitating mutliple authentication methods, multiple centralized and decentralized file stores and the ability to drag and drop between them all. It proves and provides the following features:

- AUTHENTICATION and AUTHORIZATION. Integration into Media Sourcery's Auth Service which supports the following authentications:
-- Active Directory  
-- Blockstack ID  
-- Consensys uPort  
-- email  
-- local directory  
-- W3C DiD (coming soon)  

- FILE STORAGE ACCESS. Once authenticated and authorized, allows access to the following file stores:
-- upload from local  
-- MSI Test File Storage (AWS)  
-- Blockstack Gaia (after Blockstack authentication)  
-- IPFS (after uPort authentication)  
-- arweave permastore  
-- FileCoin (coming soon)  

- NOTIFICATION and TRACKING. Allow user to share objects (documents, apps, etc.),  notify potential viewers of new content, and track link clicks and views.

- (under development) NETWORK EFFECT TOKEN SHARING. The network effect token would be used as an incentive by the user posting the document to get the viewers to view the document. This mechanism would provide for an incentive if the document was viewed quickly (i.e., within one hour, the recipient was motivated to review and respond), or within an expiration time period. The incentive token is meant to be tied to how the person authenticates. So - if he authenticates via Blockstack and has an arweave wallet, he could choose how he wants to incentivize the recipient (Stacks tokens or arweave tokens). If the user authenticates with uPort, he could choose FileCoin (in the future) or ETH or arweave. This would incentivize the recipients to become senders and users of the app by providing them tokens. We’ve considered having a “storage translation token” (similar to Kyber but for storage) but the world does not need another token.

- (under development) ARWEAVE PROFIT SHARING TOKEN STRATEGY. The obvious method for this is to reward the users/senders that pull in the most people. But, like equity, that rewards the early birds more. There should be a way to reset the PST based on monthly or quarterly usage. But we haven’t cracked that nut yet. Perhaps like a Tezos or Kyber system there is a voting DAO that determines this - but again, this usually rewards the early and long term adopters. Maybe this is the right way to do it.

- (under development) TOPL BLOCKCHAIN INTEGRATION. Add result set of TOPL blockchain transaction to arweave


## Usage

1. Request Access. User will be notified when authorized.
2. Authenticate using identity of choice.
3. Depending on authentication mechanism, upload files to MSI Test Storage or decentralized blockchain storage associated with authentication...or arweave permanweb storage.
4. If arweave desired, can generate wallet and get tokens.
5. Can delete if decentralized storage provides that capability.
6. Enter list of viewers for notification
7. Track clicks and views.

## Futures

- integration into Media Sourcery Workflow object model



## Team (in alphabetical order)

- Website: <a href="https://www.mediasourcery.com/">mediasourcery.com</a>

👤 Alex Rodriguez
- Github: [@alexrdz](https://github.com/alexrdz)

👤 Chris Tate
- Github: [@ctate](https://github.com/ctate)

👤 Crystal Tate
- Github: [@crystal](https://github.com/crystal)

👤 George Ramirez
- Github: [@GRamirez2](https://github.com/GRamirez2)

👤 Hunter Jefferson
- Github: [@hunter-atk](https://github.com/hunter-atk)

👤 Jarrod Medrano
- Github: [@jarrodmedrano](https://github.com/jarrodmedrano)

👤 Larry Ketchersid

- Personal Website: <a href="https://www.duskbeforethedawn.net/">duskbeforethedawn.net</a>
- Github: [@lketchersid](https://github.com/lketchersid)
