const PromiseA = require('bluebird').Promise;
const fs = PromiseA.promisifyAll(require('fs'));
const path = require('path');
const ursa = require('ursa');
const mkdirpAsync = PromiseA.promisify(require('mkdirp'));

export default (pathname) => {
  const key = ursa.generatePrivateKey(1024, 65537);
  const privpem = key.toPrivatePem();
  const pubpem = key.toPublicPem();
  const dirKey = 'rsaKey/' + pathname
  const privkey = path.join(dirKey, 'privkey.pem');
  const pubkey = path.join(dirKey, 'pubkey.pem');

  return mkdirpAsync(dirKey).then(function () {
    return PromiseA.all([
      fs.writeFileAsync(privkey, privpem, 'ascii')
      , fs.writeFileAsync(pubkey, pubpem, 'ascii')
    ]);
  }).then(function () {
    return key;
  });
}

export const SignAndEncryptData = () => {
  let msg;
  let sig;
  let enc;
  let rcv;

  // Bob has his private and Alice's public key
  const privkeyBob = ursa.createPrivateKey(fs.readFileSync('./rsaKey/bob/privkey.pem'));
  const pubkeyAlice = ursa.createPublicKey(fs.readFileSync('./rsaKey/alice/pubkey.pem'));

  // Alice has her private and Bob's public key
  const privkeyAlice = ursa.createPrivateKey(fs.readFileSync('./rsaKey/alice/privkey.pem'));
  const pubkeyBob = ursa.createPublicKey(fs.readFileSync('./rsaKey/bob/pubkey.pem'));

  msg = "IT’S A SECRET TO EVERYBODY.";

  console.log('Encrypt with Alice Public; Sign with Bob Private');
  enc = pubkeyAlice.encrypt(msg, 'utf8', 'base64');
  sig = privkeyBob.hashAndSign('sha256', msg, 'utf8', 'base64');
  console.log('encrypted', enc, '\n');
  console.log('signed', sig, '\n');

  console.log('Decrypt with Alice Private; Verify with Bob Public');
  rcv = privkeyAlice.decrypt(enc, 'base64', 'utf8');
  if (msg !== rcv) {
    throw new Error("invalid decrypt");
  }
  rcv = new Buffer(rcv).toString('base64');
  if (!pubkeyBob.hashAndVerify('sha256', rcv, sig, 'base64')) {
    throw new Error("invalid signature");
  }
  console.log('decrypted', msg, '\n');
}

export const hashAndSign = (token) => new Promise((resovle, reject) => {
  try {
    let msg;
    let sig;
    let enc;

    // Bob has his private and Alice's public key
    const privkeyBob = ursa.createPrivateKey(fs.readFileSync('./rsaKey/bob/privkey.pem'));
    const pubkeyAlice = ursa.createPublicKey(fs.readFileSync('./rsaKey/alice/pubkey.pem'));

    console.log('Encrypt with Alice Public; Sign with Bob Private');
    enc = pubkeyAlice.encrypt(token, 'utf8', 'base64');
    sig = privkeyBob.hashAndSign('sha256', msg, 'utf8', 'base64');
    console.log('encrypted', enc, '\n');
    console.log('signed', sig, '\n');
    resovle({ enc, sig })
  } catch (error) {
    reject(error)
  }
})

export const hashAndVerify = (encryptToken, sig) => new Promise((resovle, reject) => {
  try {
    let rcv, token;
    // Alice has her private and Bob's public key
    const privkeyAlice = ursa.createPrivateKey(fs.readFileSync('./rsaKey/alice/privkey.pem'));
    const pubkeyBob = ursa.createPublicKey(fs.readFileSync('./rsaKey/bob/pubkey.pem'));

    console.log('Decrypt with Alice Private; Verify with Bob Public');
    token = privkeyAlice.decrypt(enc, 'base64', 'utf8');

    rcv = new Buffer(rcv).toString('base64');
    if (!pubkeyBob.hashAndVerify('sha256', rcv, sig, 'base64')) {
      const err = new Error("invalid signature")

      eject(err)
      throw err;
    }
    console.log('decrypted', token, '\n');
    resovle(token)
  } catch (error) {
    reject(error)
  }
})