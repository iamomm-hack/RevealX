# Quick Start Guide - Local Development

## Abhi ke liye aapko ye karna hai:

### 1. Contract Compile ho raha hai

```bash
cd smart-contracts
npx hardhat compile
```

### 2. Local Hardhat Node chalana (ek alag terminal mein)

```bash
cd smart-contracts
npx hardhat node
```

Ye command ek local blockchain start karegi aur aapko 20 test accounts degi har ek mein 10000 ETH ke saath.

### 3. Contract Deploy karna (dusre terminal mein)

```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost
```

Contract address copy kar lena jo deploy hone ke baad dikhai dega.

### 4. .env.local file banana

Root directory mein `.env.local` file banao (gitignore mein hai, safe hai):

```
NEXT_PUBLIC_CONTRACT_ADDRESS=<jo-address-mila-upar-se>
NEXT_PUBLIC_PINATA_JWT=test_mode_no_ipfs
```

### 5. Development Server Start karo

```bash
npm run dev
```

## Important Notes:

**Local Development ke liye:**

- IPFS optional hai abhi - aap bina bhi test kar sakte ho
- Hardhat local network pe test accounts already funded hain
- MetaMask mein Hardhat network add karna hoga:
  - Network Name: Hardhat Local
  - RPC URL: http://localhost:8545
  - Chain ID: 31337
  - Currency: ETH

**Testing Capsule Creation:**

1. MetaMask connect karo (Hardhat network pe)
2. Create Capsule page pe jao
3. Message likho
4. Future date/time select karo
5. Stake amount daalo (0.01 ETH minimum recommended)
6. Create karo!

Contract local network pe deploy hoga (test ETH se), aur aap features test kar sakte ho bina real deployment ke.
