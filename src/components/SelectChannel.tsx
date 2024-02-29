import React, { useEffect } from "react";
import { useDebounce, useDebouncedCallback } from 'use-debounce';

import Loader from "./Loader";
import axios from "axios";


export default function SelectChannel({
  onClose,
  onChoose
}: {
  onClose: () => void,
  onChoose: (channel: Channel) => void
}) {
  const [channels, setChannels] = React.useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = React.useState<Channel[]>([]);

  const debounced = useDebouncedCallback(
    (value) => {
      setFilteredChannels(
        channels.filter((channel) => channel.channel.name.toLowerCase().includes(value.toLowerCase()))
      )
    },
    500
  );

  const loadTrendingChannels = async (): Promise<Channel[]> => {
    const {
      data: {
        channels
      }
    } = await axios.get('https://api.neynar.com/v2/farcaster/channel/trending?time_window=7d', {
      headers: {
        'api_key': 'NEYNAR_API_DOCS'
      }
    });

    return channels;
  }

  const init = async () => {
    const channels = await loadTrendingChannels();

    setChannels(channels);
    setFilteredChannels(channels);
  };

  useEffect(() => {
    init();
  }, []);

  const channelsRows =
    <table>
      <thead>
        <tr>
          <th>Channel</th>
          <th>Casts</th>
        </tr>
      </thead>

      <tbody>
        {
          filteredChannels.map((channel) => {
            return (
              <tr key={channel.channel.id} onClick={() => {
                onChoose(channel);
              }}>
                <td>
                  { channel.channel.name }
                </td>
                <td>
                  { channel.cast_count_30d }
                </td>
              </tr>
            );
          })
        }
      </tbody>
    </table>;

  return (
    <div style={{
      width: '115%',
      position: 'absolute',
      top: '-50px',
      left: '-15px',
      zIndex: 2,
    }} >
      <div>
        <span>Select channel</span>

        <button onClick={onClose}>
          <span className='close-icon' />
        </button>
      </div>

      <div>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            onChange={(e) => {
              debounced(e.target.value);
            }}
            className="mb-3"
            placeholder="Search..."
          />
        </div>

        {
          channels.length === 0 && (
            <Loader/>
          )
        }

        {
          channels.length > 0 && (
            <div style={{ height: '60vh' }}>
              { channelsRows }
            </div>
          )
        }
      </div>
    </div>
  );
}
