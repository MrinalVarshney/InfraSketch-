## ![App Screenshot](hackLogo.png)

## Team Name : InfraGenX

### Leader : Mrinal Varshney

### Member 1 : Shivansh Mishra

### Member 2 : Vishal Patel

### Member 3 : Manish Bhukar

---

[Video Link](https://drive.google.com/file/d/1I6DeUCko3kg5_A9w4dMJlgQRWjATsgbY/view?usp=drive_link) |[Presentation Link](https://docs.google.com/presentation/d/1c9yZ-Z6Jd1-Ib2GWKJZdKBooBFGtrE2P/edit?usp=drive_link&ouid=106787449728337787260&rtpof=true&sd=true)

---

# InfraSketch: Design. Visualize. Deploy.

## ~ Vision

**InfraSketch** is a visual-first infrastructure design platform that empowers developers and teams to architect cloud-based systems faster and smarter. With drag-and-drop capabilities and intelligent configuration generation, InfraSketch brings clarity and automation to cloud deployment planning.

---

## ~ Highlights

### 1. Visual Infrastructure Modeling

Drag and drop components like EC2, VPCs, Subnets, Databases, Load Balancers, etc., onto a canvas to model your cloud infrastructure visually.

### 2. Smart Parent-Child Mapping

Automatically assigns parent-child relationships (e.g., EC2 under VPC/Subnet) to generate logically structured configurations.

### 3. Real-Time Terraform Code Generation

As you design, we generate live-updating Terraform configuration code, streamlining your deployment process.

### 4. Extensible Node Properties

Customize infrastructure nodes with detailed configuration options (region, instance type, tags, scripts, etc.)

### 5. Export & Deploy

Export your infrastructure setup as `.tf` files and directly deploy using your own CI/CD pipeline or Terraform CLI.

---

## ~ Why It Matters

### Problems Solved:

- Manual creation of cloud infrastructure code is error-prone and time-consuming.
- Lack of visibility into architecture during planning.
- Difficult collaboration among infrastructure and development teams.

### Our Purpose:

We aim to simplify infrastructure design for developers and DevOps teams, reduce misconfigurations, and accelerate cloud deployment with:

- Visual design clarity
- Auto-generated Terraform
- Support for collaboration
- Scalable architecture patterns

---

## ~ Tech Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS, React Flow (@xyflow/react)
- **State Management**: Zustand
- **Infra Code Generator**: Custom JSON to Terraform parser
- **Utilities**: Prettier, JSZip for code packaging
- **Deployment**: AWS , K8, Docker

---

## ~ Getting Started

### 1. Clone the repository

## ~ Getting Started

Follow these steps to run the project locally:

### 1. Clone the repository:

```bash
git clone https://github.com/MrinalVarshney/InfraSketch-
cd InfraSketch-
```

### 2. Frontend Setup:

```bash
cd frontend
npm install
```

### 3. Create a .env.local file:

```bash
GOOGLE_CLIENT_ID="Your Google Client Id"
GOOGLE_CLIENT_SECRET="Your Google Client Secret"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="Your Next Auth Secret"
MONGODB_URL="Your MongoDB URI"

```


### 4. Run the development server:

```bash
npm run dev
```

Visit http://localhost:3000 to see the app in action.

---

### 2. Backend Setup:

```bash
cd backend

```

### 3. Run Terraform template Engine:

```
cd terraform_template_engine
python -m venv myenv
python3 -m venv myenv
source myenv/bin/activate
uvicorn main:app --reload
```


### 4. Run the development server:

```bash
cd ..
cd ..
cd frontend
npm run dev
```

###5. Run Nodejs Server:

```
cd ..
cd backend
cd validation_service
npm i
tsc -b
node dist/index.js
```

Visit http://localhost:3000 to see the app in action.

---

## ~ Contributing

If you'd like to contribute to **InfraSketch-**, we welcome your input! Please follow these steps:

1. #### Fork the repository :

   Click on the "Fork" button at the top-right corner of the GitHub page to create your copy of the repository.

2. #### Create a new branch for your feature :
   ```bash
   git checkout -b feature-name
   ```
3. #### Make your changes and commit them :

   ```bash
   git add .
   git commit -m "Add feature description"
   ```

4. #### Push to the branch :

   ```bash
   git push origin feature-name
   ```

5. #### Submit a Pull Request :
   Open a pull request on GitHub and provide a detailed description of your changes.

---


![App Screenshot](hackLogo.png)
