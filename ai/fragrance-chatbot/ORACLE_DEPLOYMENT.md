# Deploy your chatbot on Oracle Always Free

The website stays on Vercel and the ASP.NET API stays on Render. An Oracle VM runs only the Python model service and an HTTPS reverse proxy. The container downloads the public Qwen base model during its build; a trained adapter can be mounted later.

This guide targets an **Ubuntu 24.04 ARM VM with 2 OCPUs, 12 GB RAM, and a 50 GB boot volume**. Oracle's current Always Free allowance for free tenancies is 2 OCPUs / 12 GB total across Ampere A1 instances, with up to 200 GB of combined block storage. Resources must be in your home region. Use Always Free resources, rather than relying on the temporary trial credits. [Official limits](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)

Oracle can run out of free capacity and reclaim idle instances. The deployment restarts after ordinary process failures and VM reboots; that does not prevent a provider from reclaiming a VM. Keep the source bundle and adapter outside the VM too.

## 1. Create your account and VM

Complete signup and card verification yourself at [Oracle Cloud Free Tier](https://signup.cloud.oracle.com/). Keep card information and account credentials out of the chat. Remain on the free account; a paid upgrade is not part of this setup.

In **Compute > Instances > Create instance**, choose:

| Setting | Value |
| --- | --- |
| Image | Ubuntu 24.04, ARM, Always Free eligible |
| Shape | VM.Standard.A1.Flex |
| OCPUs / RAM | 2 / 12 GB, including any existing A1 instances |
| Boot volume | 50 GB, default performance, within your total free storage allowance |
| Network | Public subnet with internet gateway |
| Public IPv4 | Automatically assigned public IPv4 |
| SSH | Your SSH public key; save the private key securely |

Check that the selected shape, image, and storage remain Always Free eligible. If A1 is unavailable, try another availability domain in your home region or wait for capacity. Do not substitute a paid shape or upgrade the account to bypass capacity limits. [Creating an instance](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm)

Add ingress rules in the VM's network security group or subnet security list:

- TCP 22 from your current public IP only, for SSH.
- TCP 80 and 443 from the internet, for HTTPS and certificate validation.

Port 8001 is bound to VM loopback by the deployment and does not need an internet ingress rule. Preserve any existing OS firewall rules; allow web traffic through the OS firewall if required. Docker-published ports can bypass UFW, so the OCI network rules remain important. [Docker networking notes](https://docs.docker.com/engine/install/ubuntu/#firewall-limitations)

## 2. Copy the deployment bundle

On your Windows computer, from `ai/fragrance-chatbot`:

```powershell
python prepare_deployment.py
scp -i "PATH_TO_YOUR_SSH_PRIVATE_KEY" artifacts/oracle-deployment.zip ubuntu@VM_PUBLIC_IP:~/
ssh -i "PATH_TO_YOUR_SSH_PRIVATE_KEY" ubuntu@VM_PUBLIC_IP
```

Replace both placeholders with your real key path and VM public IPv4. The bundle is an explicit list of public deployment sources; it excludes `.env`, customer data, model caches, and SSH keys.

On the VM:

```bash
sudo apt-get update
sudo apt-get install -y unzip python3
mkdir -p ~/fragrance-chatbot
unzip ~/oracle-deployment.zip -d ~/fragrance-chatbot
cd ~/fragrance-chatbot
```

Install Docker Engine and its Compose plugin using [Docker's Ubuntu apt-repository instructions](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository). The official packages support ARM64. Use `sudo docker` for the commands below. Do not add your SSH user to the Docker group just to run this guide.

## 3. Configure free HTTPS and a private service key

Because your store currently uses a Vercel address, this setup uses a hostname such as `fragrance-chat.PUBLIC-IP-WITH-DASHES.sslip.io`. The DNS service resolves the IP embedded in the name; no domain purchase or DNS account is required. Caddy obtains a certificate for that hostname when ports 80/443 are reachable. [Hostname and TLS documentation](https://nip.io/), [Caddy HTTPS](https://caddyserver.com/docs/automatic-https)

```bash
python3 configure_deployment.py --ip VM_PUBLIC_IP
```

This creates a private `.env` containing `AI_HOST` and a random service key. It prints the hostname, but not the key. It refuses to overwrite an existing `.env`, preserving a previously configured key. If you later own a domain, point an A record at the VM and use `--host ai.your-domain.example` during initial configuration instead.

The hostname follows your VM's IP. If that IP changes, update `AI_HOST` in `.env` and the URL on Render. If certificate issuance hits the shared DNS domain's rate limit, the same IP-based hostname can use `nip.io` instead of `sslip.io`; edit `AI_HOST` and recreate the proxy. Do not disable HTTPS verification to work around certificate failures.

## 4. Build and start the model service

```bash
sudo docker compose -f compose.oracle.yml config --quiet
sudo docker compose -f compose.oracle.yml up -d --build
sudo docker compose -f compose.oracle.yml ps
sudo docker compose -f compose.oracle.yml logs --tail=50 model proxy
```

The first build downloads CPU libraries and roughly 1 GB of model files. It runs natively on the VM's ARM architecture. The image pins the same Qwen model commit used by the local learning lab. The proxy starts after the model is healthy. Caddy's certificates persist in named Docker volumes. Both services restart after a reboot or ordinary process crash.

The model requires a service key in this hosted profile and runs under a non-root user with two inference threads. Docker health checks call the authenticated `/health` endpoint without logging the key. One generation runs at a time; simultaneous generations receive a busy response. Do not use `docker compose config` without `--quiet` when sharing output because expanded configuration contains the service key.

For a readiness check on the VM:

```bash
sudo docker compose -f compose.oracle.yml exec -T model python healthcheck.py
```

Exit code 0 means ready. A request to the public `/health` without a service key should return **401**, showing that the service is reachable and protected. A ready authenticated request returns JSON with `ready: true`. If model readiness is false, inspect the model logs; if HTTPS fails, check DNS, certificate logs, and OCI ingress rules before changing Render.

The container configuration and Python logic are checked locally. A real ARM image build, VM networking, and certificate issuance still need verification on your Oracle VM.

## 5. Connect Render and deploy Vercel

Copy the service key directly from the VM's private `.env` into your Render API's environment settings. Do not post it in chat, commit it, or put it in a `NEXT_PUBLIC_` variable.

Set these variables on the existing ASP.NET API service:

```dotenv
Chatbot__Enabled=true
Chatbot__BaseUrl=https://YOUR_GENERATED_AI_HOST/
Chatbot__ServiceKey=THE_KEY_FROM_THE_VM_ENV_FILE
```

Deploy the backend changes to Render. Deploy the frontend changes to Vercel using the connected production branch. Keep `NEXT_PUBLIC_API_BASE_URL` pointing to the existing Render API's `/api` URL. Leave `NEXT_PUBLIC_CHATBOT_ENABLED` unset or set it to `true`.

Verify:

1. Your Render API's `GET /api/chat/status` returns `{"ready":true}`.
2. `POST /api/chat` with `{"message":"What is attar?"}` returns a reviewed answer.
3. A fragrance selection question returns generated text; a question mentioning a catalog product supplies live product cards when a match exists.
4. The chat button on your actual Vercel website sends and receives replies.

If the Render API is on its free plan, its own cold start remains a source of delay. The Oracle model VM does not eliminate that delay. Database credentials and existing Render/Vercel deployment settings stay with their respective platforms.

## 6. Load your Colab-trained adapter later

Copy the three exported adapter files into `~/fragrance-chatbot/adapter`: `adapter_config.json`, `adapter_model.safetensors`, and `training.json`. Make the directory and files readable by the container's UID 1000 without making them writable by it:

```bash
chmod 755 adapter
chmod 644 adapter/adapter_config.json adapter/adapter_model.safetensors adapter/training.json
```

Create `compose.adapter.yml` next to `compose.oracle.yml`:

```yaml
services:
  model:
    environment:
      CHATBOT_ADAPTER_DIR: /app/adapter
    volumes:
      - ./adapter:/app/adapter:ro
```

Then restart with the override:

```bash
sudo docker compose -f compose.oracle.yml -f compose.adapter.yml up -d
```

The runtime checks that the adapter matches the downloaded base revision. If you trained against a different revision, set `MODEL_REVISION` in the VM's `.env` to the revision from `training.json`, then rebuild with the same two Compose files and `--build`.

After enabling an adapter, include both Compose files in subsequent start/recreate commands. Roll back to the base model with `sudo docker compose -f compose.oracle.yml up -d`. Keep the adapter on your computer as a backup and compare answers before using it on the live site.
