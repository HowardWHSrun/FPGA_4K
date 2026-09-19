#!/bin/bash
# live.sh — start daemon + live GUI for real-time ADC streaming
DIR="$(cd "$(dirname "$0")" && pwd)"
SOCK=/tmp/adc_daemon.sock

# kill any old daemon
if [ -S "$SOCK" ]; then
    echo "Stopping old daemon..."
    "$DIR/adc_ctl" quit 2>/dev/null
    sleep 0.5
fi

echo "Starting adc_daemon..."
"$DIR/adc_daemon" &
DAEMON_PID=$!
sleep 1

# verify it's alive
if ! kill -0 $DAEMON_PID 2>/dev/null; then
    echo "Daemon failed to start (is the FT600 plugged in?)"
    exit 1
fi

echo "Daemon running (PID $DAEMON_PID). Launching live UI..."
python3 "$DIR/adc_live.py"

# when GUI closes, stop the daemon
echo "Stopping daemon..."
"$DIR/adc_ctl" quit 2>/dev/null
wait $DAEMON_PID 2>/dev/null
echo "Done."
