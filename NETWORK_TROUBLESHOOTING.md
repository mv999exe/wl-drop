# 🌐 Network Troubleshooting Guide

## Problem: Cannot Access from Other Devices

If you can access WL-Drop from your computer but **NOT from other devices** on the same WiFi network, this is a **firewall issue**.

---

## ✅ Quick Solutions

### 🪟 Windows

#### Option 1: Allow through Windows Firewall (Recommended)

1. **Open Windows Firewall Settings:**
   - Press `Win + R`
   - Type: `firewall.cpl`
   - Press Enter

2. **Click "Allow an app or feature through Windows Defender Firewall"**

3. **Click "Change Settings"** (requires admin)

4. **Click "Allow another app..."**

5. **Browse and select:**
   - If installed: `C:\Program Files\WL-Drop\python\python.exe`
   - If portable: Find `python.exe` in your WL-Drop folder

6. **Check both boxes:**
   - ✅ Private
   - ✅ Public

7. **Click "Add"** and then **"OK"**

#### Option 2: Create Firewall Rule (Advanced)

Open PowerShell as Administrator and run:

```powershell
New-NetFirewallRule -DisplayName "WL-Drop Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

#### Option 3: Temporarily Disable Firewall (Testing Only)

⚠️ **Not recommended for security reasons**

1. Open Windows Security
2. Go to Firewall & network protection
3. Disable firewall temporarily
4. Test if WL-Drop works
5. **Remember to re-enable firewall!**

---

### 🐧 Linux

#### UFW (Ubuntu/Debian/Kali)

```bash
# Allow port 8000
sudo ufw allow 8000/tcp

# Check status
sudo ufw status

# If UFW is inactive, enable it
sudo ufw enable
```

#### Firewalld (Fedora/CentOS/RHEL)

```bash
# Allow port 8000
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload

# Check status
sudo firewall-cmd --list-ports
```

#### iptables (Generic)

```bash
# Allow port 8000
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT

# Save rules (Ubuntu/Debian)
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# Save rules (RHEL/CentOS)
sudo service iptables save
```

---

### 🍎 macOS

#### Allow through macOS Firewall

1. Open **System Preferences**
2. Click **Security & Privacy**
3. Click **Firewall** tab
4. Click the lock icon and authenticate
5. Click **Firewall Options**
6. Click the **+** button
7. Add Python or wl-drop executable
8. Click **Add** and then **OK**

#### Command Line (Alternative)

```bash
# Allow port 8000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/python
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /path/to/python
```

---

## 🔍 Verify It's Working

### 1. Check Server is Running
```bash
# On the server computer, test locally
curl http://localhost:8000

# Should return HTML content
```

### 2. Check Port is Open
```bash
# Linux/macOS
sudo netstat -tulpn | grep :8000

# Windows (PowerShell)
netstat -ano | findstr :8000

# Should show LISTENING on 0.0.0.0:8000
```

### 3. Test from Another Device

On your phone or another computer on the same WiFi:

1. Open browser
2. Go to: `http://192.168.x.x:8000` (use the IP shown by WL-Drop)
3. Should load immediately

If it hangs/times out = **Firewall is blocking**

---

## 📱 Additional Tips

### 1. Make Sure Devices are on Same Network

- Both devices must be on the **same WiFi network**
- Guest networks may block device-to-device communication
- Some routers have "AP Isolation" enabled (disable it)

### 2. Check Router Settings

Some routers block LAN-to-LAN communication:

1. Login to your router admin panel
2. Look for "AP Isolation" or "Client Isolation"
3. **Disable** it
4. Save and reboot router

### 3. Use Correct IP Address

- Don't use `localhost` or `127.0.0.1` from other devices
- Use the actual local network IP (starts with `192.168.` or `10.`)
- WL-Drop shows the correct IP when it starts

### 4. Antivirus Software

Some antivirus programs have their own firewall:

- **Kaspersky**: Add Python to trusted applications
- **Norton**: Allow WL-Drop in Smart Firewall
- **Avast**: Add exception for port 8000
- **McAfee**: Configure firewall rules

---

## 🚨 Common Errors

### Error: "Connection Timed Out"
**Cause:** Firewall blocking the port
**Solution:** Follow firewall instructions above

### Error: "Connection Refused"
**Cause:** Server not running or wrong port
**Solution:** Make sure WL-Drop is running and check the port number

### Error: "Cannot Resolve Host"
**Cause:** Wrong IP address
**Solution:** Use the IP shown by WL-Drop when it starts

---

## 💡 Quick Test Commands

### Windows (PowerShell)
```powershell
# Test if port is accessible from another device
Test-NetConnection -ComputerName 192.168.x.x -Port 8000
```

### Linux/macOS
```bash
# Test if port is accessible
nc -zv 192.168.x.x 8000

# Or with telnet
telnet 192.168.x.x 8000
```

If connection succeeds → Firewall is open ✅  
If connection fails → Firewall is blocking ❌

---

## 📞 Still Need Help?

1. **Check firewall logs** to see if connections are being blocked
2. **Try a different port** (e.g., 3000): `wl-drop -p 3000`
3. **Temporarily disable ALL security software** to test
4. **Check router firewall settings**

---

## ⚡ Summary

**95% of "can't connect from other devices" issues are firewall-related.**

**Quick Fix:**
- Windows: Allow Python through Windows Firewall
- Linux: `sudo ufw allow 8000/tcp`
- macOS: Add Python to Firewall exceptions

**Then restart WL-Drop and try again!**
