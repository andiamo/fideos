#!/usr/bin/env bash

LOCATION="public/user-img"

find $LOCATION -type f -mmin +30 -delete
