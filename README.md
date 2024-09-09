

---

# Three-Tier Application on Kubernetes with AWS ALB

### Home Page
<img src="https://github.com/user-attachments/assets/fe5013e9-9bad-4f42-818b-f11e8c255a82" alt="Home" width="500px">

### Architecture Diagram
<img src="https://github.com/user-attachments/assets/db9df0b2-1f64-4b55-a671-968dfed9285d" alt="Architecture" width="500px">

This repository contains a full-stack three-tier application deployed using Kubernetes. The application consists of a React frontend, an Express backend, and a MongoDB database. The infrastructure is hosted on AWS and uses an Application Load Balancer (ALB) for routing traffic.

## Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Application Setup](#application-setup)
- [Kubernetes Manifests](#kubernetes-manifests)
- [Backend API](#backend-api)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Accessing the Application](#accessing-the-application)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

```bash
.
├── client                     # React frontend application
├── server                     # Express backend application
├── k8s_manifests               # Kubernetes manifests for deployment and services
│   ├── front-end               # Frontend service and deployment manifests
│   ├── back-end                # Backend service and deployment manifests
│   └── ingress.yml             # Ingress configuration for AWS Application Load Balancer (ALB)
└── README.md                  # Project documentation
```

## Technologies Used

- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB (Cloud-hosted)
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **Cloud Provider:** AWS EKS
- **Load Balancer:** AWS Application Load Balancer (ALB)

## Prerequisites

- Docker
- Kubernetes
- AWS CLI
- eksctl
- kubectl
- helm
- A cloud-hosted MongoDB instance

## Application Setup

### Backend (Express)
The backend is a custom REST API built with Node.js and Express. It provides endpoints to calculate income tax and save records to MongoDB.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/three-tier-app.git
   cd three-tier-app/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory and add the following environment variables:

   ```bash
   MONGO_URI=mongodb+srv://<username>:<madeup-password>@cluster0.mongodb.net/Tax-Me?retryWrites=true&w=majority
   PORT=3500
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend (React)
The frontend is built using React and communicates with the backend API.

1. Navigate to the `client` directory:
   ```bash
   cd ../client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm start
   ```

## Kubernetes Manifests

### Frontend (React)

#### Service (`frontendservice.yml`)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: three-tier
spec:
  selector:
    role: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

#### Deployment (`frontenddeployment.yml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: three-tier
  labels:
    role: frontend
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      role: frontend
  template:
    metadata:
      labels:
        role: frontend
    spec:
      containers:
      - name: frontend
        image: public.ecr.aws/s7u2f5t6/three-tier-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_BACKEND_URL
          value: "http://api.suyogapi.org/api/taxes"
```

### Backend (Express)

#### Service (`backendservice.yml`)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: three-tier
spec:
  selector:
    role: api
  ports:
    - protocol: TCP
      port: 3500
  type: ClusterIP
```

#### Deployment (`backenddeployment.yml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: three-tier
  labels:
    role: api
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      role: api
  template:
    metadata:
      labels:
        role: api
    spec:
      containers:
      - name: api
        image: public.ecr.aws/s7u2f5t6/three-tier-backend:latest
        ports:
        - containerPort: 3500
        env:
        - name: MONGO_URI
          value: "mongodb+srv://user:madeupPassword@cluster0.mongodb.net/taxDB?retryWrites=true&w=majority"
        - name: PORT
          value: "3500"
```

### Ingress for AWS ALB (`ingress.yml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mainlb
  namespace: three-tier
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
spec:
  ingressClassName: alb  # Ensure your ingress class is ALB (AWS Application Load Balancer)
  rules:
    - host: www.suyogapi.org  # Updated host to match REACT_APP_BACKEND_URL
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api  # Ensure this matches the exact service name for the backend
                port:
                  number: 3500
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend  # Ensure this matches the exact service name for the frontend
                port:
                  number: 3000
```

## Backend API

### Endpoints
1. `POST /api/taxes`: Calculate and save the tax based on the income.
2. `GET /api/taxes`: Retrieve all saved tax records.
3. `DELETE /api/taxes/:id`: Delete a tax record by ID.

### Sample API Request
```bash
POST /api/taxes
{
    "income": 50000
}
```

### Sample API Response
```bash
{
    "tax": 7500,
    "income": 50000,
    "id": "60f8a83f83814c001b3b3a0d"
}
```

## Environment Variables

### Backend (`.env`)
```bash
MONGO_URI=mongodb+srv://<username>:<madeup-password>@cluster0.mongodb.net/taxDB?retryWrites=true&w=majority
PORT=3500
```

### Frontend
In the Kubernetes manifest for the frontend, the `REACT_APP_BACKEND_URL` points to the backend API via the ALB domain.

## Deployment

1. **Deploy Backend:**
   ```bash
   kubectl apply -f k8s_manifests/back-end/backenddeployment.yml
   kubectl apply -f k8s_manifests/back-end/backendservice.yml
   ```

2. **Deploy Frontend:**
   ```bash
   kubectl apply -f k8s_manifests/front-end/frontenddeployment.yml
   kubectl apply -f k8s_manifests/front-end/frontendservice.yml
   ```

3. **Deploy Ingress (AWS ALB):**
   ```bash
   kubectl apply -f k8s_manifests/ingress.yml
   ```

## Accessing the Application

Once the ALB is set up, you can access the application by navigating to `http://www.suyogapi.org` in your browser.

- Frontend: `http://www.suyogapi.org`
- Backend: `http://www.suyogapi.org/api/taxes`

## Contributing

Feel free to submit issues or pull requests if you'd like to contribute to this project.

## License

This project is licensed under the MIT License.

### AWS Load Balancer
<img src="https://github.com/user-attachments/assets/8eb6f6d3-6e50-44e8-81f0-ea8ad028f8b2" alt="Load Balancer" width="500px">

### AWS EKS Cluster
<img src="https://github.com/user-attachments/assets/3db00ad4

-7a96-412e-92df-e316cfa165b5" alt="EKS" width="500px">

### AWS ECR Repository
<img src="https://github.com/user-attachments/assets/e988b933-d0d9-4583-8bc4-52645863cea0" alt="ECR" width="500px">

### Kubernetes Cluster Instances
<img src="https://github.com/user-attachments/assets/1b4e5de6-ded3-4b13-b8e4-ff00365dca8f" alt="Cluster Instances" width="500px">

---

