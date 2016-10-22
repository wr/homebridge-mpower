# homebridge-mpower
This is a plugin for [homebridge](https://github.com/nfarina/homebridge). It allows you to control your Ubiquiti mPower outlets with HomeKit.

# Installation

1. Install homebridge (if not already installed) using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-mpower`
3. Update your configuration file. See below for a sample.

# Configuration

```
"platforms": [
  {
    "platform": "mPower",
    "name": "mPower",
    "outlets": [
      {
        "name": "Fan",
        "username": "admin",
        "password": "hunter2",
        "url": "10.0.1.5",
        "id": "1"
      },
      {
        "name": "Hall Light",
        "username": "admin",
        "password": "hunter2",
        "url": "10.0.1.5",
        "id": "2"
      },
      {
        "name": "Mr. Coffee",
        "username": "admin",
        "password": "Correct Horse Battery Staple",
        "url": "10.0.1.6",
        "id": "1"
      }
    ]
  }
]
```

| Parameter | Description |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name` | The human-readable name of the device plugged into your outlet |
| `username` | Your mFi Controller username |
| `password` | Your mFi Controller password |
| `url` | May be either a hostname or an IP address |
| `id` | The specific outlet you hope to control. For mPower mini, this can only be `1`. For mPower and mPower PRO, you might have to do some trial and error to figure out which outlet has which `id`. I only have an mPower mini, so I can't check :) |


# How it works
This plugin is basically a homebridge-compatible implementation of the [Ubiquiti mFi outlet HTTP API](https://community.ubnt.com/t5/mFi/mPower-mFi-Switch-and-mFi-In-Wall-Outlet-HTTP-API/td-p/1076449). It sends a HTTP request via `curl` to your mFi outlet device (not the controller) to manually toggle the device `on` or `off`.